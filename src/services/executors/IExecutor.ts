import { QueryResult, TableData } from '@/types';

export interface IExecutor {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  setupTables(tables: TableData[]): Promise<void>;
  execute(code: string, limit?: number): Promise<QueryResult>;
  cleanup(): Promise<void>;
}
