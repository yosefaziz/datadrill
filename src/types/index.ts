// Skill types
export type SkillType = 'sql' | 'pyspark' | 'debug';

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

// Discriminated union of all question types
export type Question = SqlQuestion | PySparkQuestion | DebugQuestion;

// Metadata for question listings (minimal data for index)
export interface QuestionMeta {
  id: string;
  skill: SkillType;
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

// Helper to get tables from any question type
export function getQuestionTables(question: Question): TableData[] {
  return question.tables;
}

// Helper to get expected query from any question type
export function getExpectedQuery(question: Question): string {
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
