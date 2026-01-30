import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuestionStore } from '@/stores/questionStore';
import { useEditorStore } from '@/stores/editorStore';
import { useDuckDB } from '@/hooks/useDuckDB';
import { useQuery } from '@/hooks/useQuery';
import { useValidation } from '@/hooks/useValidation';
import { QuestionViewLayout } from '@/components/question-view/QuestionViewLayout';

export function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { currentQuestion, isLoading, error, fetchQuestion } = useQuestionStore();
  const { sql, clearSql } = useEditorStore();
  const { isInitialized, isLoading: isDuckDBLoading, error: duckDBError } = useDuckDB();
  const { result, isExecuting, executeQuery, clearResult } = useQuery();
  const { validationResult, isValidating, validate, clearValidation } = useValidation();

  useEffect(() => {
    if (id) {
      fetchQuestion(id);
      clearSql();
      clearResult();
      clearValidation();
    }
  }, [id, fetchQuestion, clearSql, clearResult, clearValidation]);

  const handleRun = async () => {
    if (!currentQuestion || !isInitialized) return;
    clearValidation();
    await executeQuery(sql, currentQuestion.tables);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !isInitialized) return;
    clearResult();
    await validate(currentQuestion, sql);
  };

  if (isLoading || isDuckDBLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-2">
            {isDuckDBLoading ? 'Initializing SQL engine...' : 'Loading question...'}
          </div>
          <div className="text-sm text-slate-500">This may take a moment</div>
        </div>
      </div>
    );
  }

  if (error || duckDBError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || duckDBError}</div>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to questions
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-4">Question not found</div>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <QuestionViewLayout
      question={currentQuestion}
      result={result}
      validationResult={validationResult}
      isExecuting={isExecuting}
      isValidating={isValidating}
      onRun={handleRun}
      onSubmit={handleSubmit}
    />
  );
}
