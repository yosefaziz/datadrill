import { IExecutor } from './IExecutor';
import { pandasRuntime } from '@/services/python/PandasRuntime';
import { QueryResult, TableData } from '@/types';

class PandasExecutor implements IExecutor {
  async initialize(): Promise<void> {
    await pandasRuntime.initialize();
  }

  isInitialized(): boolean {
    return pandasRuntime.isInitialized();
  }

  async setupTables(tables: TableData[]): Promise<void> {
    await pandasRuntime.dropAllDataFrames();
    for (const table of tables) {
      await pandasRuntime.createDataFrame(table.name, table.visibleData);
    }
  }

  async execute(code: string, limit?: number): Promise<QueryResult> {
    const result = await pandasRuntime.executeCode(code);

    if (limit && result.rows.length > limit) {
      return {
        ...result,
        rows: result.rows.slice(0, limit),
      };
    }

    return result;
  }

  async cleanup(): Promise<void> {
    await pandasRuntime.dropAllDataFrames();
  }
}

export const pandasExecutor = new PandasExecutor();
