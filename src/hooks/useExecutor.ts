import { useState, useEffect, useCallback } from 'react';
import { getExecutor, getExecutorForDebug } from '@/services/executors/ExecutorFactory';
import { TableData, QueryResult, Question, isDebugQuestion } from '@/types';

export function useExecutor(question: Question | null) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get the appropriate executor based on question type
  const getQuestionExecutor = useCallback(() => {
    if (!question) return null;
    if (isDebugQuestion(question)) {
      return getExecutorForDebug(question.language);
    }
    return getExecutor(question.skill);
  }, [question]);

  useEffect(() => {
    let mounted = true;
    const executor = getQuestionExecutor();

    if (!executor) {
      setIsLoading(false);
      return;
    }

    async function init() {
      try {
        setIsLoading(true);
        setError(null);
        await executor!.initialize();
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize executor');
          setIsLoading(false);
        }
      }
    }

    // Only initialize if not already initialized
    if (!executor.isInitialized()) {
      init();
    } else {
      setIsInitialized(true);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [getQuestionExecutor]);

  const executeCode = useCallback(async (code: string, tables: TableData[]) => {
    const executor = getQuestionExecutor();
    if (!executor) {
      setResult({ columns: [], rows: [], error: 'No executor available' });
      return;
    }

    setIsExecuting(true);
    try {
      await executor.setupTables(tables);
      const queryResult = await executor.execute(code, 100);
      setResult(queryResult);
      return queryResult;
    } finally {
      setIsExecuting(false);
    }
  }, [getQuestionExecutor]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    result,
    isExecuting,
    executeCode,
    clearResult,
  };
}
