// Skill types
export type SkillType = 'sql' | 'python' | 'debug' | 'architecture' | 'modeling';

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

// Python question - write DataFrame transformations
export interface PythonQuestion extends BaseQuestion {
  skill: 'python';
  tables: TableData[]; // Input DataFrames
  expectedOutputQuery: string; // PySpark solution
}

// Debug question - fix broken pipelines
export interface DebugQuestion extends BaseQuestion {
  skill: 'debug';
  language: 'sql' | 'python';
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

// Data Modeling question types
export type FieldDataType = 'integer' | 'string' | 'timestamp' | 'decimal' | 'boolean';
export type TableType = 'fact' | 'dimension';

export interface ModelingField {
  id: string;
  name: string;
  dataType: FieldDataType;
  description: string;
  cardinality: 'low' | 'medium' | 'high'; // How many unique values (affects storage)
  sampleValues?: string[];
}

export interface ModelingTableConfig {
  type: TableType;
  name: string;
  requiredFields: string[]; // Field IDs that should be in this table
  optionalFields: string[]; // Field IDs that are acceptable
  feedback: string;
}

export interface ModelingScoreThresholds {
  storage: { green: number; yellow: number }; // Under green = good, under yellow = ok, above = bad
  queryCost: { green: number; yellow: number };
}

export interface ModelingQuestion {
  id: string;
  skill: 'modeling';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  prompt: string;
  constraint: string; // e.g., "Star Schema for fast aggregation"
  fields: ModelingField[];
  expectedTables: ModelingTableConfig[];
  scoreThresholds: ModelingScoreThresholds;
  guidance?: string;
}

export interface UserTable {
  id: string;
  type: TableType;
  name: string;
  fieldIds: string[];
}

export interface ModelingValidationResult {
  passed: boolean;
  storageScore: number;
  queryCostScore: number;
  maxStorageScore: number;
  maxQueryCostScore: number;
  storageStatus: 'green' | 'yellow' | 'red';
  queryCostStatus: 'green' | 'yellow' | 'red';
  tableResults: {
    tableName: string;
    tableType: TableType;
    fieldCount: number;
    feedback: string;
    issues: string[];
  }[];
  overallFeedback: string;
}

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
export type Question = SqlQuestion | PythonQuestion | DebugQuestion | ArchitectureQuestion | ModelingQuestion;

// Metadata for question listings (minimal data for index)
export interface QuestionMeta {
  id: string;
  skill: SkillType;
  questionType?: ArchitectureQuestionType; // Only for architecture questions
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  // Solution playbook fields (optional — questions without these appear in Interview Questions only)
  track?: string;
  trackLevel?: number;
  trackOrder?: number;
  concepts?: string[];
  bloomLevel?: string;
  interviewRelevant?: boolean;
  expectedTime?: number;
}

// ── Skill Track Types ─────────────────────────────────────────────

export type UnlockCondition = 'always_unlocked' | 'complete_previous' | 'score_threshold';

export interface SkillTrackLevel {
  level: number;
  title: string;
  description: string;
  concepts: string[];
  questionIds: string[];
  unlockCondition: UnlockCondition;
  threshold?: number;
}

export interface SkillTrack {
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
  levels: SkillTrackLevel[];
}

export interface SkillTrackMeta {
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

export interface TrackProgress {
  trackId: string;
  completedQuestionIds: string[];
  currentLevel: number;
  percentComplete: number;
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

export function isPythonQuestion(question: Question): question is PythonQuestion {
  return question.skill === 'python';
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

export function isModelingQuestion(question: Question): question is ModelingQuestion {
  return question.skill === 'modeling';
}

// Helper to get tables from any question type (not applicable to architecture/modeling questions)
export function getQuestionTables(question: Question): TableData[] {
  if (isArchitectureQuestion(question) || isModelingQuestion(question)) {
    return [];
  }
  return question.tables;
}

// Helper to get expected query from any question type (not applicable to architecture/modeling questions)
export function getExpectedQuery(question: Question): string {
  if (isArchitectureQuestion(question) || isModelingQuestion(question)) {
    return '';
  }
  return question.expectedOutputQuery;
}

// Helper to get editor language for a question
export function getEditorLanguage(question: Question): 'sql' | 'python' {
  if (question.skill === 'python') return 'python';
  if (question.skill === 'debug') return question.language === 'python' ? 'python' : 'sql';
  return 'sql';
}

// Helper to get initial code for editor
export function getInitialCode(question: Question): string {
  if (isDebugQuestion(question)) {
    return question.brokenCode;
  }
  return '';
}

// ── Auth & User Types ──────────────────────────────────────────────

export type UserRole = 'student' | 'junior' | 'mid' | 'senior' | 'staff';
export type UserGoal = 'interview_prep' | 'skill_building' | 'career_switch';
export type WeakestSkill = 'sql' | 'python' | 'architecture' | 'modeling';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  birth_year: number | null;
  gender: string | null;
  role: UserRole | null;
  primary_goal: UserGoal | null;
  weakest_skill: WeakestSkill | null;
  onboarding_completed: boolean;
  pre_registration_activity: AnonymousActivity | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingSurvey {
  username: string;
  role: UserRole;
  primary_goal: UserGoal;
  weakest_skill: WeakestSkill;
  birth_year: number;
  gender: string;
}

// ── Submission Types ───────────────────────────────────────────────

export interface Submission {
  id: string;
  user_id: string;
  question_id: string;
  skill: SkillType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answer: string;
  passed: boolean;
  result_meta: Record<string, unknown> | null;
  created_at: string;
}

export interface SubmissionInsert {
  question_id: string;
  skill: SkillType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answer: string;
  passed: boolean;
  result_meta?: Record<string, unknown> | null;
}

// ── Anonymous Tracking Types ───────────────────────────────────────

export interface AnonymousAttempt {
  questionId: string;
  skill: SkillType;
  timestamp: string;
  passed: boolean;
}

export interface AnonymousActivity {
  id: string;
  questionsViewed: string[];
  attempts: AnonymousAttempt[];
  totalSessionTime: number;
  firstSeen: string;
  lastSeen: string;
}

// ── Stats Types ────────────────────────────────────────────────────

export interface SkillStats {
  skill: SkillType;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  mastery: number;
}

export interface UserStats {
  totalSolved: number;
  totalAttempted: number;
  passRate: number;
  skills: SkillStats[];
}
