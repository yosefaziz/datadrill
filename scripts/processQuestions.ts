import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import * as yaml from 'js-yaml';

type SkillType = 'sql' | 'python' | 'debug' | 'architecture' | 'modeling';
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
  hints?: string[];
}

interface SqlFrontmatter extends BaseFrontmatter {}

interface PythonFrontmatter extends BaseFrontmatter {}

interface DebugFrontmatter extends BaseFrontmatter {
  language: 'sql' | 'python';
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
  hints?: string[];
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
  hints?: string[];
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
  hints?: string[];
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
  hints?: string[];
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
  hints?: string[];
}

interface SqlProcessedQuestion extends BaseProcessedQuestion {
  skill: 'sql';
  tables: ProcessedTable[];
  expectedOutputQuery: string;
}

interface PythonProcessedQuestion extends BaseProcessedQuestion {
  skill: 'python';
  tables: ProcessedTable[];
  expectedOutputQuery: string;
}

interface DebugProcessedQuestion extends BaseProcessedQuestion {
  skill: 'debug';
  language: 'sql' | 'python';
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
  hints?: string[];
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
  hints?: string[];
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
  hints?: string[];
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
  hints?: string[];
}

type ProcessedQuestion =
  | SqlProcessedQuestion
  | PythonProcessedQuestion
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
  track?: string;
  trackLevel?: number;
  trackOrder?: number;
  concepts?: string[];
  bloomLevel?: string;
  interviewRelevant?: boolean;
  expectedTime?: number;
}

// ── Track types ──────────────────────────────────────────────────

type UnlockCondition = 'always_unlocked' | 'complete_previous' | 'score_threshold';

interface TrackLevelYaml {
  level: number;
  title: string;
  description: string;
  concepts: string[];
  questions: string[];
  unlock: UnlockCondition;
  threshold?: number;
}

interface TrackYaml {
  id: string;
  name: string;
  tagline: string;
  interviewer_says: string;
  you_need: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  prerequisites: string[];
  levels: TrackLevelYaml[];
}

interface ProcessedTrackLevel {
  level: number;
  title: string;
  description: string;
  concepts: string[];
  questionIds: string[];
  unlockCondition: UnlockCondition;
  threshold?: number;
}

interface ProcessedTrack {
  id: string;
  skill: SkillType;
  name: string;
  tagline: string;
  interviewerSays: string;
  youNeed: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  prerequisites: string[];
  levels: ProcessedTrackLevel[];
}

interface ProcessedTrackMeta {
  id: string;
  skill: SkillType;
  name: string;
  tagline: string;
  interviewerSays: string;
  youNeed: string;
  icon: string;
  category: string;
  order: number;
  prerequisites: string[];
  totalLevels: number;
  totalQuestions: number;
}

// ── Interview scenario types ────────────────────────────────────

interface InterviewQuizOptionYaml {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface InterviewRoundYaml {
  id: string;
  type: SkillType;
  question_type: string;
  time_minutes: number;
  title: string;
  description: string;
  initial_code?: string;
  tables?: TableFrontmatter[];
  hidden_tables?: TableFrontmatter[];
  expected_output?: string;
  expected_output_query?: string;
  language?: 'sql' | 'python';
  hints?: string[];
  questions?: InterviewQuizOptionYaml[];
}

interface InterviewScenarioYaml {
  id: string;
  category: 'coding' | 'system_design';
  level: 'junior' | 'mid' | 'senior' | 'staff';
  title: string;
  description: string;
  estimated_minutes: number;
  tags: string[];
  rounds: InterviewRoundYaml[];
}

interface ProcessedInterviewRound {
  id: string;
  type: SkillType;
  questionType: string;
  timeMinutes: number;
  title: string;
  description: string;
  initialCode?: string;
  tables?: ProcessedTable[];
  hiddenTables?: ProcessedTable[];
  expectedOutput?: string;
  expectedOutputQuery?: string;
  language?: 'sql' | 'python';
  hints?: string[];
  questions?: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
}

interface ProcessedInterviewScenario {
  id: string;
  category: 'coding' | 'system_design';
  level: 'junior' | 'mid' | 'senior' | 'staff';
  title: string;
  description: string;
  estimatedMinutes: number;
  tags: string[];
  rounds: ProcessedInterviewRound[];
}

interface ProcessedInterviewMeta {
  id: string;
  category: 'coding' | 'system_design';
  level: 'junior' | 'mid' | 'senior' | 'staff';
  title: string;
  description: string;
  estimatedMinutes: number;
  roundCount: number;
  tags: string[];
}

const SKILL_DIRS: SkillType[] = ['sql', 'python', 'debug', 'architecture', 'modeling'];

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
    hints: frontmatter.hints,
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
    hints: frontmatter.hints,
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
    hints: frontmatter.hints,
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
    hints: frontmatter.hints,
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
  const expectedOutput = parts[1] ? parts[1].trim() : '';

  const tables = (data.tables as TableFrontmatter[]).map(processTable);

  const baseQuestion = {
    id,
    skill,
    title: data.title,
    difficulty: data.difficulty as Difficulty,
    tags: data.tags as string[],
    description,
    expectedOutput,
    hints: data.hints as string[] | undefined,
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
    case 'python': {
      const frontmatter = data as PythonFrontmatter;
      return {
        ...baseQuestion,
        skill: 'python',
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

function processInterviewRound(round: InterviewRoundYaml): ProcessedInterviewRound {
  const processed: ProcessedInterviewRound = {
    id: round.id,
    type: round.type,
    questionType: round.question_type,
    timeMinutes: round.time_minutes,
    title: round.title,
    description: round.description,
  };

  if (round.initial_code) processed.initialCode = round.initial_code;
  if (round.tables) processed.tables = round.tables.map(processTable);
  if (round.hidden_tables) processed.hiddenTables = round.hidden_tables.map(processTable);
  if (round.expected_output) processed.expectedOutput = round.expected_output;
  if (round.expected_output_query) processed.expectedOutputQuery = round.expected_output_query;
  if (round.language) processed.language = round.language;
  if (round.hints) processed.hints = round.hints;
  if (round.questions) {
    processed.questions = round.questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
    }));
  }

  return processed;
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

    // Find all markdown files for this skill (excluding README files and tracks directory)
    const files = (await glob('**/*.md', { cwd: skillDir })).filter(
      (f) => !f.toLowerCase().includes('readme') && !f.startsWith('tracks/')
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
        const { data: frontmatterData } = matter(content);
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

        // Add optional track fields from frontmatter
        if (frontmatterData.track) meta.track = frontmatterData.track;
        if (frontmatterData.track_level != null) meta.trackLevel = frontmatterData.track_level;
        if (frontmatterData.track_order != null) meta.trackOrder = frontmatterData.track_order;
        if (frontmatterData.concepts) meta.concepts = frontmatterData.concepts;
        if (frontmatterData.bloom_level) meta.bloomLevel = frontmatterData.bloom_level;
        if (frontmatterData.interview_relevant != null) meta.interviewRelevant = frontmatterData.interview_relevant;
        if (frontmatterData.expected_time != null) meta.expectedTime = frontmatterData.expected_time;

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

    // Process skill tracks
    const tracksDir = path.join(skillDir, 'tracks');
    if (fs.existsSync(tracksDir)) {
      const tracksOutputDir = path.join(skillOutputDir, 'tracks');
      fs.mkdirSync(tracksOutputDir, { recursive: true });

      const trackFiles = (await glob('*.yaml', { cwd: tracksDir })).concat(
        await glob('*.yml', { cwd: tracksDir })
      );

      const trackMetas: ProcessedTrackMeta[] = [];

      for (const trackFile of trackFiles) {
        try {
          const trackContent = fs.readFileSync(path.join(tracksDir, trackFile), 'utf-8');
          const trackData = yaml.load(trackContent) as TrackYaml;

          const processedTrack: ProcessedTrack = {
            id: trackData.id,
            skill,
            name: trackData.name,
            tagline: trackData.tagline || '',
            interviewerSays: trackData.interviewer_says,
            youNeed: trackData.you_need,
            description: trackData.description,
            icon: trackData.icon,
            category: trackData.category,
            order: trackData.order,
            prerequisites: trackData.prerequisites || [],
            levels: trackData.levels.map((l) => ({
              level: l.level,
              title: l.title,
              description: l.description,
              concepts: l.concepts,
              questionIds: l.questions,
              unlockCondition: l.unlock,
              threshold: l.threshold,
            })),
          };

          // Write individual track file
          fs.writeFileSync(
            path.join(tracksOutputDir, `${trackData.id}.json`),
            JSON.stringify(processedTrack, null, 2)
          );

          // Build track meta
          const totalQuestions = trackData.levels.reduce((sum, l) => sum + l.questions.length, 0);
          trackMetas.push({
            id: trackData.id,
            skill,
            name: trackData.name,
            tagline: trackData.tagline || '',
            interviewerSays: trackData.interviewer_says,
            youNeed: trackData.you_need,
            icon: trackData.icon,
            category: trackData.category,
            order: trackData.order,
            prerequisites: trackData.prerequisites || [],
            totalLevels: trackData.levels.length,
            totalQuestions,
          });

          console.log(`Processed track: ${skill}/tracks/${trackFile}`);
        } catch (error) {
          console.error(`Error processing track ${skill}/tracks/${trackFile}:`, error);
        }
      }

      // Sort by order and write tracks index
      trackMetas.sort((a, b) => a.order - b.order);
      fs.writeFileSync(
        path.join(tracksOutputDir, 'index.json'),
        JSON.stringify(trackMetas, null, 2)
      );

      console.log(`  ${trackMetas.length} tracks processed for ${skill}`);
    }
  }

  // ── Process interview scenarios ───────────────────────────────
  const interviewsDir = path.join(questionsDir, 'interviews');
  const interviewsOutputDir = path.join(process.cwd(), 'public', 'interviews');
  fs.mkdirSync(interviewsOutputDir, { recursive: true });

  if (fs.existsSync(interviewsDir)) {
    const interviewFiles = (await glob('**/*.yaml', { cwd: interviewsDir })).concat(
      await glob('**/*.yml', { cwd: interviewsDir })
    );

    const interviewMetas: ProcessedInterviewMeta[] = [];

    for (const file of interviewFiles) {
      try {
        const content = fs.readFileSync(path.join(interviewsDir, file), 'utf-8');
        const data = yaml.load(content) as InterviewScenarioYaml;

        const scenario: ProcessedInterviewScenario = {
          id: data.id,
          category: data.category,
          level: data.level,
          title: data.title,
          description: data.description,
          estimatedMinutes: data.estimated_minutes,
          tags: data.tags,
          rounds: data.rounds.map(processInterviewRound),
        };

        // Write individual scenario file
        fs.writeFileSync(
          path.join(interviewsOutputDir, `${data.id}.json`),
          JSON.stringify(scenario, null, 2)
        );

        interviewMetas.push({
          id: data.id,
          category: data.category,
          level: data.level,
          title: data.title,
          description: data.description,
          estimatedMinutes: data.estimated_minutes,
          roundCount: data.rounds.length,
          tags: data.tags,
        });

        console.log(`Processed interview: ${file}`);
      } catch (error) {
        console.error(`Error processing interview ${file}:`, error);
      }
    }

    // Write interview index
    fs.writeFileSync(
      path.join(interviewsOutputDir, 'index.json'),
      JSON.stringify(interviewMetas, null, 2)
    );

    console.log(`\nProcessed ${interviewMetas.length} interview scenarios.`);
  } else {
    // No interviews directory yet - write empty index
    fs.writeFileSync(
      path.join(interviewsOutputDir, 'index.json'),
      '[]'
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
