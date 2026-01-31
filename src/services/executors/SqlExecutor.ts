import { IExecutor } from './IExecutor';
import { duckDBService } from '@/services/duckdb/DuckDBService';
import { QueryResult, TableData } from '@/types';

class SqlExecutor implements IExecutor {
  async initialize(): Promise<void> {
    await duckDBService.initialize();
  }

  isInitialized(): boolean {
    return duckDBService.isInitialized();
  }

  async setupTables(tables: TableData[]): Promise<void> {
    await duckDBService.dropAllTables();
    for (const table of tables) {
      await duckDBService.createTable(table.name, table.visibleData);
    }
  }

  async execute(code: string, limit?: number): Promise<QueryResult> {
    return duckDBService.executeQuery(code, limit);
  }

  async cleanup(): Promise<void> {
    await duckDBService.dropAllTables();
  }
}

export const sqlExecutor = new SqlExecutor();
