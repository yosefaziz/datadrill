import { IExecutor } from './IExecutor';
import { codingRuntime } from '@/services/python/CodingRuntime';
import { QueryResult, TableData } from '@/types';

class CodingExecutor implements IExecutor {
  async initialize(): Promise<void> {
    await codingRuntime.initialize();
  }

  isInitialized(): boolean {
    return codingRuntime.isInitialized();
  }

  async setupTables(_tables: TableData[]): Promise<void> {
    // No tables for coding questions
  }

  async execute(code: string, _limit?: number): Promise<QueryResult> {
    return await codingRuntime.execute(code);
  }

  async cleanup(): Promise<void> {
    // No cleanup needed
  }
}

export const codingExecutor = new CodingExecutor();
