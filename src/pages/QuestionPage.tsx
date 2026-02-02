import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuestionStore } from '@/stores/questionStore';
import { useEditorStore } from '@/stores/editorStore';
import { useExecutor } from '@/hooks/useExecutor';
import { useValidation } from '@/hooks/useValidation';
import { QuestionViewLayout } from '@/components/question-view/QuestionViewLayout';
import { ArchitectureQuestionView } from '@/components/architecture/ArchitectureQuestionView';
import { CanvasQuestionView } from '@/components/architecture/canvas/CanvasQuestionView';
import { QuizQuestionView } from '@/components/architecture/quiz/QuizQuestionView';
import { ModelingQuestionView } from '@/components/modeling/ModelingQuestionView';
import { SkillType, getInitialCode, isArchitectureQuestion, isCanvasQuestion, isConstraintsQuestion, isQuizQuestion, isModelingQuestion } from '@/types';

function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'pyspark' || skill === 'debug' || skill === 'architecture' || skill === 'modeling';
}

export function QuestionPage() {
  const { skill, id } = useParams<{ skill: string; id: string }>();
  const { currentQuestion, isLoading, error, fetchQuestion } = useQuestionStore();
  const { code, setCode, clearCode } = useEditorStore();
  const {
    isInitialized,
    isLoading: isExecutorLoading,
    error: executorError,
    result,
    isExecuting,
    executeCode,
    clearResult,
  } = useExecutor(currentQuestion);
  const { validationResult, isValidating, validate, clearValidation } = useValidation();

  useEffect(() => {
    if (isValidSkill(skill) && id) {
      fetchQuestion(skill, id);
      clearCode();
      clearResult();
      clearValidation();
    }
  }, [skill, id, fetchQuestion, clearCode, clearResult, clearValidation]);

  // Set initial code for debug questions
  useEffect(() => {
    if (currentQuestion) {
      const initialCode = getInitialCode(currentQuestion);
      if (initialCode) {
        setCode(initialCode);
      }
    }
  }, [currentQuestion, setCode]);

  const handleRun = async () => {
    if (!currentQuestion || !isInitialized || isArchitectureQuestion(currentQuestion) || isModelingQuestion(currentQuestion)) return;
    clearValidation();
    await executeCode(code, currentQuestion.tables);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !isInitialized) return;
    clearResult();
    await validate(currentQuestion, code);
  };

  if (!isValidSkill(skill)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-4">Invalid skill: {skill}</div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Architecture and modeling questions don't need executor loading
  const needsExecutor = skill !== 'architecture' && skill !== 'modeling';
  const showExecutorLoading = needsExecutor && isExecutorLoading;

  if (isLoading || showExecutorLoading) {
    const loadingMessage = showExecutorLoading
      ? skill === 'pyspark'
        ? 'Initializing Python engine...'
        : 'Initializing SQL engine...'
      : 'Loading question...';

    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-2">{loadingMessage}</div>
          <div className="text-sm text-slate-500">This may take a moment</div>
        </div>
      </div>
    );
  }

  const displayError = error || (needsExecutor ? executorError : null);
  if (displayError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{displayError}</div>
          <Link
            to={`/${skill}`}
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
            to={`/${skill}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to questions
          </Link>
        </div>
      </div>
    );
  }

  // Render modeling questions
  if (isModelingQuestion(currentQuestion)) {
    return <ModelingQuestionView question={currentQuestion} />;
  }

  // Render architecture questions with their specialized views
  if (isCanvasQuestion(currentQuestion)) {
    return <CanvasQuestionView question={currentQuestion} />;
  }

  if (isQuizQuestion(currentQuestion)) {
    return <QuizQuestionView question={currentQuestion} />;
  }

  if (isConstraintsQuestion(currentQuestion)) {
    return <ArchitectureQuestionView question={currentQuestion} />;
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
