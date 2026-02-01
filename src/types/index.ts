// Skill types
export type SkillType = 'sql' | 'pyspark' | 'debug' | 'architecture';

export interface TableData {
  name: string;
  visibleData: string;
  hiddenDatasets: string[];
}

// Base question interface with common fields
interface BaseQuestion {
  id: string;
  skill: SkillType;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  expectedOutput: string;
}

// SQL question - write queries from scratch
export interface SqlQuestion extends BaseQuestion {
  skill: 'sql';
  tables: TableData[];
  expectedOutputQuery: string;
}

// PySpark question - write DataFrame transformations
export interface PySparkQuestion extends BaseQuestion {
  skill: 'pyspark';
  tables: TableData[]; // Input DataFrames
  expectedOutputQuery: string; // PySpark solution
}

// Debug question - fix broken pipelines
export interface DebugQuestion extends BaseQuestion {
  skill: 'debug';
  language: 'sql' | 'pyspark';
  tables: TableData[];
  brokenCode: string; // Pre-filled buggy code
  expectedOutputQuery: string;
  hint?: string; // Optional hint for the bug
}

// Architecture question types
export type ArchitectureQuestionType = 'constraints' | 'canvas' | 'quiz';
export type ClarifyingQuestionCategory = 'crucial' | 'helpful' | 'irrelevant';

export interface ClarifyingQuestion {
  id: string;
  text: string;
  category: ClarifyingQuestionCategory;
  reveals?: {
    constraint: string;
    value: string;
  };
}

export interface ArchitectureOptionCondition {
  constraint: string;
  value: string;
}

export interface ArchitectureOption {
  id: string;
  name: string;
  description: string;
  valid_when: ArchitectureOptionCondition[];
  feedback_if_wrong: string;
}

// Constraints question (existing architecture question type)
export interface ConstraintsQuestion {
  id: string;
  skill: 'architecture';
  questionType: 'constraints';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  prompt: string;
  description: string;
  clarifyingQuestions: ClarifyingQuestion[];
  architectureOptions: ArchitectureOption[];
  maxQuestions: number;
  guidance?: string;
}

// Canvas question types
export interface CanvasStepChoice {
  componentId: string;
  feedback: string;
}

export interface CanvasStep {
  id: string;
  name: string;
  description: string;
  validChoices: CanvasStepChoice[];
  invalidChoices: CanvasStepChoice[];
  partialChoices?: CanvasStepChoice[];
}

export interface CanvasQuestion {
  id: string;
  skill: 'architecture';
  questionType: 'canvas';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  prompt: string;
  description: string;
  steps: CanvasStep[];
  availableComponents: string[];
  guidance?: string;
}

export interface CanvasStepResult {
  stepId: string;
  stepName: string;
  selectedComponent: string | null;
  status: 'correct' | 'partial' | 'wrong' | 'missing';
  feedback: string;
  points: number;
}

export interface CanvasValidationResult {
  passed: boolean;
  totalScore: number;
  maxScore: number;
  stepResults: CanvasStepResult[];
}

// Quiz question types
export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  skill: 'architecture';
  questionType: 'quiz';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  question: string;
  description: string;
  answers: QuizAnswer[];
  multiSelect: boolean; // true if multiple answers can be correct
  explanation?: string; // Overall explanation shown after answering
}

export interface QuizValidationResult {
  passed: boolean;
  selectedAnswers: string[];
  correctAnswers: string[];
  answerResults: {
    answerId: string;
    answerText: string;
    wasSelected: boolean;
    isCorrect: boolean;
    explanation?: string;
  }[];
  overallExplanation?: string;
}

// Union of architecture question types
export type ArchitectureQuestion = ConstraintsQuestion | CanvasQuestion | QuizQuestion;

export interface ArchitectureValidationResult {
  passed: boolean;
  totalScore: number;
  questionScores: {
    questionId: string;
    questionText: string;
    category: ClarifyingQuestionCategory;
    points: number;
  }[];
  revealedConstraints: { constraint: string; value: string }[];
  architectureCorrect: boolean;
  architectureFeedback: string;
  missedCrucialQuestions: ClarifyingQuestion[];
  irrelevantQuestionsSelected: ClarifyingQuestion[];
}

// Discriminated union of all question types
export type Question = SqlQuestion | PySparkQuestion | DebugQuestion | ArchitectureQuestion;

// Metadata for question listings (minimal data for index)
export interface QuestionMeta {
  id: string;
  skill: SkillType;
  questionType?: ArchitectureQuestionType; // Only for architecture questions
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  error?: string;
}

export interface ValidationResult {
  passed: boolean;
  totalDatasets: number;
  passedDatasets: number;
  error?: string;
}

// Skill metadata for homepage
export interface SkillInfo {
  id: SkillType;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
}

// Type guards for question types
export function isSqlQuestion(question: Question): question is SqlQuestion {
  return question.skill === 'sql';
}

export function isPySparkQuestion(question: Question): question is PySparkQuestion {
  return question.skill === 'pyspark';
}

export function isDebugQuestion(question: Question): question is DebugQuestion {
  return question.skill === 'debug';
}

export function isArchitectureQuestion(question: Question): question is ArchitectureQuestion {
  return question.skill === 'architecture';
}

export function isConstraintsQuestion(question: Question): question is ConstraintsQuestion {
  return question.skill === 'architecture' && (question as ArchitectureQuestion).questionType === 'constraints';
}

export function isCanvasQuestion(question: Question): question is CanvasQuestion {
  return question.skill === 'architecture' && (question as ArchitectureQuestion).questionType === 'canvas';
}

export function isQuizQuestion(question: Question): question is QuizQuestion {
  return question.skill === 'architecture' && (question as ArchitectureQuestion).questionType === 'quiz';
}

// Helper to get tables from any question type (not applicable to architecture questions)
export function getQuestionTables(question: Question): TableData[] {
  if (isArchitectureQuestion(question)) {
    return [];
  }
  return question.tables;
}

// Helper to get expected query from any question type (not applicable to architecture questions)
export function getExpectedQuery(question: Question): string {
  if (isArchitectureQuestion(question)) {
    return '';
  }
  return question.expectedOutputQuery;
}

// Helper to get editor language for a question
export function getEditorLanguage(question: Question): 'sql' | 'python' {
  if (question.skill === 'pyspark') return 'python';
  if (question.skill === 'debug') return question.language === 'pyspark' ? 'python' : 'sql';
  return 'sql';
}

// Helper to get initial code for editor
export function getInitialCode(question: Question): string {
  if (isDebugQuestion(question)) {
    return question.brokenCode;
  }
  return '';
}
