import { IExecutor } from './IExecutor';
import { pySparkService } from '@/services/pyspark/PySparkService';
import { QueryResult, TableData } from '@/types';

class PythonExecutor implements IExecutor {
  async initialize(): Promise<void> {
    await pySparkService.initialize();
  }

  isInitialized(): boolean {
    return pySparkService.isInitialized();
  }

  async setupTables(tables: TableData[]): Promise<void> {
    await pySparkService.dropAllDataFrames();
    for (const table of tables) {
      await pySparkService.createDataFrame(table.name, table.visibleData);
    }
  }

  async execute(code: string, limit?: number): Promise<QueryResult> {
    const result = await pySparkService.executeCode(code);

    // Apply limit if specified
    if (limit && result.rows.length > limit) {
      return {
        ...result,
        rows: result.rows.slice(0, limit),
      };
    }

    return result;
  }

  async cleanup(): Promise<void> {
    await pySparkService.dropAllDataFrames();
  }
}

export const pythonExecutor = new PythonExecutor();
