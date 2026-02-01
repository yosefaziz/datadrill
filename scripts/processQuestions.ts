import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

type SkillType = 'sql' | 'pyspark' | 'debug' | 'architecture';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface TableFrontmatter {
  name: string;
  visible_data: string;
  hidden_datasets: string[];
}

interface BaseFrontmatter {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  tables: TableFrontmatter[];
  expected_output_query: string;
}

interface SqlFrontmatter extends BaseFrontmatter {}

interface PySparkFrontmatter extends BaseFrontmatter {}

interface DebugFrontmatter extends BaseFrontmatter {
  language: 'sql' | 'pyspark';
  broken_code: string;
  hint?: string;
}

// Architecture question frontmatter types
interface ClarifyingQuestionFrontmatter {
  id: string;
  text: string;
  category: 'crucial' | 'helpful' | 'irrelevant';
  reveals?: {
    constraint: string;
    value: string;
  };
}

interface ArchitectureOptionFrontmatter {
  id: string;
  name: string;
  description: string;
  valid_when: { constraint: string; value: string }[];
  feedback_if_wrong: string;
}

interface ArchitectureFrontmatter {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  clarifying_questions: ClarifyingQuestionFrontmatter[];
  architecture_options: ArchitectureOptionFrontmatter[];
  max_questions: number;
}

interface ProcessedTable {
  name: string;
  visibleData: string;
  hiddenDatasets: string[];
}

interface BaseProcessedQuestion {
  id: string;
  skill: SkillType;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  expectedOutput: string;
}

interface SqlProcessedQuestion extends BaseProcessedQuestion {
  skill: 'sql';
  tables: ProcessedTable[];
  expectedOutputQuery: string;
}

interface PySparkProcessedQuestion extends BaseProcessedQuestion {
  skill: 'pyspark';
  tables: ProcessedTable[];
  expectedOutputQuery: string;
}

interface DebugProcessedQuestion extends BaseProcessedQuestion {
  skill: 'debug';
  language: 'sql' | 'pyspark';
  tables: ProcessedTable[];
  brokenCode: string;
  expectedOutputQuery: string;
  hint?: string;
}

interface ArchitectureProcessedQuestion {
  id: string;
  skill: 'architecture';
  title: string;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  description: string;
  clarifyingQuestions: ClarifyingQuestionFrontmatter[];
  architectureOptions: ArchitectureOptionFrontmatter[];
  maxQuestions: number;
  guidance?: string;
}

type ProcessedQuestion = SqlProcessedQuestion | PySparkProcessedQuestion | DebugProcessedQuestion | ArchitectureProcessedQuestion;

interface QuestionMeta {
  id: string;
  skill: SkillType;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

const SKILL_DIRS: SkillType[] = ['sql', 'pyspark', 'debug', 'architecture'];

function processTable(table: TableFrontmatter): ProcessedTable {
  return {
    name: table.name,
    visibleData: table.visible_data.trim(),
    hiddenDatasets: table.hidden_datasets.map((d) => d.trim()),
  };
}

async function processQuestion(
  filePath: string,
  skill: SkillType,
  content: string
): Promise<ProcessedQuestion> {
  const { data, content: markdownContent } = matter(content);
  const id = path.basename(filePath, '.md');

  // Handle architecture questions differently
  if (skill === 'architecture') {
    const frontmatter = data as ArchitectureFrontmatter;

    // Parse markdown content for description and optional guidance
    const guidanceParts = markdownContent.split(/^## Guidance$/m);
    const description = await marked(guidanceParts[0].trim());
    const guidance = guidanceParts[1] ? await marked(guidanceParts[1].trim()) : undefined;

    return {
      id,
      skill: 'architecture',
      title: frontmatter.title,
      difficulty: frontmatter.difficulty,
      tags: frontmatter.tags,
      prompt: frontmatter.prompt,
      description,
      clarifyingQuestions: frontmatter.clarifying_questions,
      architectureOptions: frontmatter.architecture_options,
      maxQuestions: frontmatter.max_questions,
      guidance,
    };
  }

  // Parse markdown content
  const parts = markdownContent.split(/^## Expected Output$/m);
  const description = await marked(parts[0].trim());
  const expectedOutput = parts[1] ? await marked(parts[1].trim()) : '';

  const tables = (data.tables as TableFrontmatter[]).map(processTable);

  const baseQuestion = {
    id,
    skill,
    title: data.title,
    difficulty: data.difficulty as Difficulty,
    tags: data.tags as string[],
    description,
    expectedOutput,
  };

  switch (skill) {
    case 'sql': {
      const frontmatter = data as SqlFrontmatter;
      return {
        ...baseQuestion,
        skill: 'sql',
        tables,
        expectedOutputQuery: frontmatter.expected_output_query,
      };
    }
    case 'pyspark': {
      const frontmatter = data as PySparkFrontmatter;
      return {
        ...baseQuestion,
        skill: 'pyspark',
        tables,
        expectedOutputQuery: frontmatter.expected_output_query,
      };
    }
    case 'debug': {
      const frontmatter = data as DebugFrontmatter;
      return {
        ...baseQuestion,
        skill: 'debug',
        language: frontmatter.language,
        tables,
        brokenCode: frontmatter.broken_code,
        expectedOutputQuery: frontmatter.expected_output_query,
        hint: frontmatter.hint,
      };
    }
  }
}

async function processQuestions() {
  const questionsDir = path.join(process.cwd(), 'questions');
  const outputBaseDir = path.join(process.cwd(), 'public', 'questions');

  // Ensure base output directory exists
  fs.mkdirSync(outputBaseDir, { recursive: true });

  const allQuestionsMeta: QuestionMeta[] = [];
  let totalProcessed = 0;

  for (const skill of SKILL_DIRS) {
    const skillDir = path.join(questionsDir, skill);
    const skillOutputDir = path.join(outputBaseDir, skill);

    // Create skill output directory
    fs.mkdirSync(skillOutputDir, { recursive: true });

    // Check if skill directory exists
    if (!fs.existsSync(skillDir)) {
      console.log(`Skill directory not found: ${skill}. Creating empty index.`);
      fs.writeFileSync(path.join(skillOutputDir, 'index.json'), '[]');
      continue;
    }

    // Find all markdown files for this skill (excluding README files)
    const files = (await glob('**/*.md', { cwd: skillDir })).filter(
      (f) => !f.toLowerCase().includes('readme')
    );

    if (files.length === 0) {
      console.log(`No questions found for ${skill}. Creating empty index.`);
      fs.writeFileSync(path.join(skillOutputDir, 'index.json'), '[]');
      continue;
    }

    const skillQuestionsMeta: QuestionMeta[] = [];

    for (const file of files) {
      const filePath = path.join(skillDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      try {
        const question = await processQuestion(filePath, skill, content);

        // Write individual question file
        fs.writeFileSync(
          path.join(skillOutputDir, `${question.id}.json`),
          JSON.stringify(question, null, 2)
        );

        // Add to skill-specific index
        const meta: QuestionMeta = {
          id: question.id,
          skill: question.skill,
          title: question.title,
          difficulty: question.difficulty,
          tags: question.tags,
        };
        skillQuestionsMeta.push(meta);
        allQuestionsMeta.push(meta);

        console.log(`Processed: ${skill}/${file}`);
        totalProcessed++;
      } catch (error) {
        console.error(`Error processing ${skill}/${file}:`, error);
      }
    }

    // Write skill-specific index
    fs.writeFileSync(
      path.join(skillOutputDir, 'index.json'),
      JSON.stringify(skillQuestionsMeta, null, 2)
    );
  }

  // Write global index with all questions
  fs.writeFileSync(
    path.join(outputBaseDir, 'index.json'),
    JSON.stringify(allQuestionsMeta, null, 2)
  );

  console.log(`\nProcessed ${totalProcessed} questions across ${SKILL_DIRS.length} skills.`);
}

processQuestions().catch(console.error);
