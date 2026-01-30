import { useState, useCallback } from 'react';
import { duckDBService } from '@/services/duckdb/DuckDBService';
import { QueryResult, TableData } from '@/types';

export function useQuery() {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const setupTables = useCallback(async (tables: TableData[]) => {
    await duckDBService.dropAllTables();
    for (const table of tables) {
      await duckDBService.createTable(table.name, table.visibleData);
    }
  }, []);

  const executeQuery = useCallback(async (sql: string, tables: TableData[]) => {
    setIsExecuting(true);
    try {
      await setupTables(tables);
      const queryResult = await duckDBService.executeQuery(sql, 100);
      setResult(queryResult);
      return queryResult;
    } finally {
      setIsExecuting(false);
    }
  }, [setupTables]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return { result, isExecuting, executeQuery, clearResult };
}
