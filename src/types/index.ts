export interface TableData {
  name: string;
  visibleData: string;
  hiddenDatasets: string[];
}

export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  tables: TableData[];
  expectedOutputQuery: string;
  expectedOutput: string;
}

export interface QuestionMeta {
  id: string;
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
