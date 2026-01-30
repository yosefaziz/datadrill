import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

interface QuestionFrontmatter {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  tables: {
    name: string;
    visible_data: string;
    hidden_datasets: string[];
  }[];
  expected_output_query: string;
}

interface ProcessedQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  tables: {
    name: string;
    visibleData: string;
    hiddenDatasets: string[];
  }[];
  expectedOutputQuery: string;
  expectedOutput: string;
}

interface QuestionMeta {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

async function processQuestions() {
  const questionsDir = path.join(process.cwd(), 'questions');
  const outputDir = path.join(process.cwd(), 'public', 'questions');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Find all markdown files
  const files = await glob('**/*.md', { cwd: questionsDir });

  if (files.length === 0) {
    console.log('No question files found. Creating empty index.');
    fs.writeFileSync(path.join(outputDir, 'index.json'), '[]');
    return;
  }

  const questionIndex: QuestionMeta[] = [];

  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: markdownContent } = matter(content);
    const frontmatter = data as QuestionFrontmatter;

    // Generate ID from filename
    const id = path.basename(file, '.md');

    // Parse markdown content
    const parts = markdownContent.split(/^## Expected Output$/m);
    const description = await marked(parts[0].trim());
    const expectedOutput = parts[1] ? await marked(parts[1].trim()) : '';

    // Process question
    const question: ProcessedQuestion = {
      id,
      title: frontmatter.title,
      difficulty: frontmatter.difficulty,
      tags: frontmatter.tags,
      description,
      tables: frontmatter.tables.map((t) => ({
        name: t.name,
        visibleData: t.visible_data.trim(),
        hiddenDatasets: t.hidden_datasets.map((d) => d.trim()),
      })),
      expectedOutputQuery: frontmatter.expected_output_query,
      expectedOutput,
    };

    // Write individual question file
    fs.writeFileSync(
      path.join(outputDir, `${id}.json`),
      JSON.stringify(question, null, 2)
    );

    // Add to index
    questionIndex.push({
      id,
      title: frontmatter.title,
      difficulty: frontmatter.difficulty,
      tags: frontmatter.tags,
    });

    console.log(`Processed: ${file}`);
  }

  // Write index file
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(questionIndex, null, 2)
  );

  console.log(`\nProcessed ${files.length} questions.`);
}

processQuestions().catch(console.error);
