import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

type SkillType = 'sql' | 'pyspark' | 'debug' | 'architecture' | 'modeling';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type ArchitectureQuestionType = 'constraints' | 'canvas' | 'quiz';

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

// Architecture constraints question frontmatter types
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

interface ConstraintsFrontmatter {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  clarifying_questions: ClarifyingQuestionFrontmatter[];
  architecture_options: ArchitectureOptionFrontmatter[];
  max_questions: number;
}

// Architecture canvas question frontmatter types
interface CanvasStepChoiceFrontmatter {
  component: string;
  feedback: string;
}

interface CanvasStepFrontmatter {
  id: string;
  name: string;
  description: string;
  valid_choices: CanvasStepChoiceFrontmatter[];
  invalid_choices: CanvasStepChoiceFrontmatter[];
  partial_choices?: CanvasStepChoiceFrontmatter[];
}

interface CanvasFrontmatter {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  available_components: string[];
  steps: CanvasStepFrontmatter[];
}

// Quiz question frontmatter types
interface QuizAnswerFrontmatter {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

interface QuizFrontmatter {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  multi_select: boolean;
  answers: QuizAnswerFrontmatter[];
  explanation?: string;
}

// Modeling question frontmatter types
type FieldDataType = 'integer' | 'string' | 'timestamp' | 'decimal' | 'boolean';
type TableType = 'fact' | 'dimension';

interface ModelingFieldFrontmatter {
  id: string;
  name: string;
  data_type: FieldDataType;
  description: string;
  cardinality: 'low' | 'medium' | 'high';
  sample_values?: string[];
}

interface ModelingTableConfigFrontmatter {
  type: TableType;
  name: string;
  required_fields: string[];
  optional_fields: string[];
  feedback: string;
}

interface ModelingScoreThresholdsFrontmatter {
  storage: { green: number; yellow: number };
  query_cost: { green: number; yellow: number };
}

interface ModelingFrontmatter {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  constraint: string;
  fields: ModelingFieldFrontmatter[];
  expected_tables: ModelingTableConfigFrontmatter[];
  score_thresholds: ModelingScoreThresholdsFrontmatter;
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

interface ConstraintsProcessedQuestion {
  id: string;
  skill: 'architecture';
  questionType: 'constraints';
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

interface CanvasStepChoice {
  componentId: string;
  feedback: string;
}

interface CanvasStep {
  id: string;
  name: string;
  description: string;
  validChoices: CanvasStepChoice[];
  invalidChoices: CanvasStepChoice[];
  partialChoices?: CanvasStepChoice[];
}

interface CanvasProcessedQuestion {
  id: string;
  skill: 'architecture';
  questionType: 'canvas';
  title: string;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  description: string;
  steps: CanvasStep[];
  availableComponents: string[];
  guidance?: string;
}

interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizProcessedQuestion {
  id: string;
  skill: 'architecture';
  questionType: 'quiz';
  title: string;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  description: string;
  answers: QuizAnswer[];
  multiSelect: boolean;
  explanation?: string;
}

type ArchitectureProcessedQuestion = ConstraintsProcessedQuestion | CanvasProcessedQuestion | QuizProcessedQuestion;

// Modeling processed types
interface ModelingField {
  id: string;
  name: string;
  dataType: FieldDataType;
  description: string;
  cardinality: 'low' | 'medium' | 'high';
  sampleValues?: string[];
}

interface ModelingTableConfig {
  type: TableType;
  name: string;
  requiredFields: string[];
  optionalFields: string[];
  feedback: string;
}

interface ModelingScoreThresholds {
  storage: { green: number; yellow: number };
  queryCost: { green: number; yellow: number };
}

interface ModelingProcessedQuestion {
  id: string;
  skill: 'modeling';
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  prompt: string;
  constraint: string;
  fields: ModelingField[];
  expectedTables: ModelingTableConfig[];
  scoreThresholds: ModelingScoreThresholds;
  guidance?: string;
}

type ProcessedQuestion =
  | SqlProcessedQuestion
  | PySparkProcessedQuestion
  | DebugProcessedQuestion
  | ArchitectureProcessedQuestion
  | ModelingProcessedQuestion;

interface QuestionMeta {
  id: string;
  skill: SkillType;
  questionType?: ArchitectureQuestionType;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

const SKILL_DIRS: SkillType[] = ['sql', 'pyspark', 'debug', 'architecture', 'modeling'];

function processTable(table: TableFrontmatter): ProcessedTable {
  return {
    name: table.name,
    visibleData: table.visible_data.trim(),
    hiddenDatasets: table.hidden_datasets.map((d) => d.trim()),
  };
}

function processCanvasStepChoice(choice: CanvasStepChoiceFrontmatter): CanvasStepChoice {
  return {
    componentId: choice.component,
    feedback: choice.feedback,
  };
}

function processCanvasStep(step: CanvasStepFrontmatter): CanvasStep {
  return {
    id: step.id,
    name: step.name,
    description: step.description,
    validChoices: step.valid_choices.map(processCanvasStepChoice),
    invalidChoices: step.invalid_choices.map(processCanvasStepChoice),
    partialChoices: step.partial_choices?.map(processCanvasStepChoice),
  };
}

async function processConstraintsQuestion(
  id: string,
  frontmatter: ConstraintsFrontmatter,
  markdownContent: string
): Promise<ConstraintsProcessedQuestion> {
  // Parse markdown content for description and optional guidance
  const guidanceParts = markdownContent.split(/^## Guidance$/m);
  const description = await marked(guidanceParts[0].trim());
  const guidance = guidanceParts[1] ? await marked(guidanceParts[1].trim()) : undefined;

  return {
    id,
    skill: 'architecture',
    questionType: 'constraints',
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

async function processCanvasQuestion(
  id: string,
  frontmatter: CanvasFrontmatter,
  markdownContent: string
): Promise<CanvasProcessedQuestion> {
  // Parse markdown content for description and optional guidance
  const guidanceParts = markdownContent.split(/^## Guidance$/m);
  const description = await marked(guidanceParts[0].trim());
  const guidance = guidanceParts[1] ? await marked(guidanceParts[1].trim()) : undefined;

  return {
    id,
    skill: 'architecture',
    questionType: 'canvas',
    title: frontmatter.title,
    difficulty: frontmatter.difficulty,
    tags: frontmatter.tags,
    prompt: frontmatter.prompt,
    description,
    steps: frontmatter.steps.map(processCanvasStep),
    availableComponents: frontmatter.available_components,
    guidance,
  };
}

async function processQuizQuestion(
  id: string,
  frontmatter: QuizFrontmatter,
  markdownContent: string
): Promise<QuizProcessedQuestion> {
  // Parse markdown content for description
  const description = markdownContent.trim() ? await marked(markdownContent.trim()) : '';

  return {
    id,
    skill: 'architecture',
    questionType: 'quiz',
    title: frontmatter.title,
    difficulty: frontmatter.difficulty,
    tags: frontmatter.tags,
    question: frontmatter.question,
    description,
    answers: frontmatter.answers.map((a) => ({
      id: a.id,
      text: a.text,
      isCorrect: a.correct,
      explanation: a.explanation,
    })),
    multiSelect: frontmatter.multi_select,
    explanation: frontmatter.explanation,
  };
}

async function processModelingQuestion(
  id: string,
  frontmatter: ModelingFrontmatter,
  markdownContent: string
): Promise<ModelingProcessedQuestion> {
  // Parse markdown content for description and optional guidance
  const guidanceParts = markdownContent.split(/^## Guidance$/m);
  const description = await marked(guidanceParts[0].trim());
  const guidance = guidanceParts[1] ? await marked(guidanceParts[1].trim()) : undefined;

  return {
    id,
    skill: 'modeling',
    title: frontmatter.title,
    difficulty: frontmatter.difficulty,
    tags: frontmatter.tags,
    description,
    prompt: frontmatter.prompt,
    constraint: frontmatter.constraint,
    fields: frontmatter.fields.map((f) => ({
      id: f.id,
      name: f.name,
      dataType: f.data_type,
      description: f.description,
      cardinality: f.cardinality,
      sampleValues: f.sample_values,
    })),
    expectedTables: frontmatter.expected_tables.map((t) => ({
      type: t.type,
      name: t.name,
      requiredFields: t.required_fields,
      optionalFields: t.optional_fields,
      feedback: t.feedback,
    })),
    scoreThresholds: {
      storage: frontmatter.score_thresholds.storage,
      queryCost: frontmatter.score_thresholds.query_cost,
    },
    guidance,
  };
}

async function processQuestion(
  filePath: string,
  skill: SkillType,
  content: string,
  architectureType?: ArchitectureQuestionType
): Promise<ProcessedQuestion> {
  const { data, content: markdownContent } = matter(content);
  const id = path.basename(filePath, '.md');

  // Handle architecture questions differently based on type
  if (skill === 'architecture') {
    if (architectureType === 'canvas') {
      return processCanvasQuestion(id, data as CanvasFrontmatter, markdownContent);
    } else if (architectureType === 'quiz') {
      return processQuizQuestion(id, data as QuizFrontmatter, markdownContent);
    } else {
      // Default to constraints
      return processConstraintsQuestion(id, data as ConstraintsFrontmatter, markdownContent);
    }
  }

  // Handle modeling questions
  if (skill === 'modeling') {
    return processModelingQuestion(id, data as ModelingFrontmatter, markdownContent);
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

      // Determine architecture question type from path
      let architectureType: ArchitectureQuestionType | undefined;
      if (skill === 'architecture') {
        if (file.startsWith('canvas/')) {
          architectureType = 'canvas';
        } else if (file.startsWith('quiz/')) {
          architectureType = 'quiz';
        } else if (file.startsWith('constraints/')) {
          architectureType = 'constraints';
        } else {
          // Default to constraints for backwards compatibility
          architectureType = 'constraints';
        }
      }

      try {
        const question = await processQuestion(filePath, skill, content, architectureType);

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

        // Add questionType for architecture questions
        if (skill === 'architecture' && 'questionType' in question) {
          meta.questionType = question.questionType;
        }

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
