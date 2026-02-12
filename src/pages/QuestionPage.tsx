import { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuestionStore } from '@/stores/questionStore';
import { useTrackStore } from '@/stores/trackStore';
import { useEditorStore } from '@/stores/editorStore';
import { useExecutor } from '@/hooks/useExecutor';
import { useValidation } from '@/hooks/useValidation';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useAnonymousTracking } from '@/hooks/useAnonymousTracking';
import { QuestionViewLayout } from '@/components/question-view/QuestionViewLayout';
import { ArchitectureQuestionView } from '@/components/architecture/ArchitectureQuestionView';
import { CanvasQuestionView } from '@/components/architecture/canvas/CanvasQuestionView';
import { QuizQuestionView } from '@/components/architecture/quiz/QuizQuestionView';
import { ModelingQuestionView } from '@/components/modeling/ModelingQuestionView';
import { SkillType, getInitialCode, getQuestionTables, isArchitectureQuestion, isCanvasQuestion, isConstraintsQuestion, isQuizQuestion, isModelingQuestion, isPythonCodingQuestion, isPandasQuestion, isPredictQuestion, isTradeoffQuestion, isIncidentQuestion, isReviewQuestion, isOptimizeQuestion } from '@/types';
import { PredictQuestionView } from '@/components/tools/predict/PredictQuestionView';
import { TradeoffQuestionView } from '@/components/tools/tradeoff/TradeoffQuestionView';
import { IncidentQuestionView } from '@/components/tools/incident/IncidentQuestionView';
import { ReviewQuestionView } from '@/components/tools/review/ReviewQuestionView';
import { OptimizeQuestionView } from '@/components/tools/optimize/OptimizeQuestionView';

function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling' || skill === 'tools';
}

export function QuestionPage() {
  const { skill, id } = useParams<{ skill: string; id: string }>();
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('track');
  const { currentQuestion, isLoading, error, fetchQuestion, fetchQuestionsForSkill, getAdjacentQuestionIds } = useQuestionStore();
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
  const user = useAuthStore((s) => s.user);
  const openAuth = useAuthStore((s) => s.openAuthModal);
  const canSubmit = useSubmissionStore((s) => s.canSubmit);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);

  const fetchTrack = useTrackStore((s) => s.fetchTrack);
  const getNextInTrack = useTrackStore((s) => s.getNextQuestionInTrack);
  const getPrevInTrack = useTrackStore((s) => s.getPrevQuestionInTrack);

  useAnonymousTracking(id);

  useEffect(() => {
    if (isValidSkill(skill) && id) {
      fetchQuestion(skill, id);
      fetchQuestionsForSkill(skill);
      clearCode();
      clearResult();
      clearValidation();
    }
  }, [skill, id, fetchQuestion, fetchQuestionsForSkill, clearCode, clearResult, clearValidation]);

  useEffect(() => {
    if (trackId) fetchTrack(trackId);
  }, [trackId, fetchTrack]);

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
    await executeCode(code, getQuestionTables(currentQuestion));
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !isInitialized) return;

    // Check anonymous submission limit
    if (!canSubmit(currentQuestion.id, !!user)) {
      openAuth();
      return;
    }

    clearResult();
    const result = await validate(currentQuestion, code);

    // Record submission
    try {
      await submitAnswer(
        {
          question_id: currentQuestion.id,
          skill: currentQuestion.skill,
          difficulty: currentQuestion.difficulty,
          answer: code,
          passed: result.passed,
          result_meta: result as unknown as Record<string, unknown>,
        },
        user?.id || null
      );
    } catch {
      // Non-critical: don't block the UI if submission recording fails
    }
  };

  // Compute prev/next navigation URLs
  let prevUrl: string | null = null;
  let nextUrl: string | null = null;
  if (isValidSkill(skill) && id) {
    if (trackId) {
      const prev = getPrevInTrack(trackId, id);
      const next = getNextInTrack(trackId, id);
      if (prev) prevUrl = `/${skill}/question/${prev.questionId}?track=${trackId}`;
      if (next) nextUrl = `/${skill}/question/${next.questionId}?track=${trackId}`;
    } else {
      const { prevId, nextId } = getAdjacentQuestionIds(skill, id);
      if (prevId) prevUrl = `/${skill}/question/${prevId}`;
      if (nextId) nextUrl = `/${skill}/question/${nextId}`;
    }
  }

  if (!isValidSkill(skill)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-4">Invalid skill: {skill}</div>
          <Link to="/" className="text-primary hover:text-primary-hover transition-colors duration-200">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Architecture and modeling questions don't need executor loading
  const needsExecutor = skill !== 'architecture' && skill !== 'modeling' && skill !== 'tools';
  const showExecutorLoading = needsExecutor && isExecutorLoading;

  if (isLoading || showExecutorLoading) {
    let loadingMessage = 'Loading question...';
    if (showExecutorLoading) {
      if (currentQuestion && isPandasQuestion(currentQuestion)) {
        loadingMessage = 'Installing Pandas...';
      } else if (currentQuestion && isPythonCodingQuestion(currentQuestion)) {
        loadingMessage = 'Initializing Python...';
      } else if (skill === 'python') {
        loadingMessage = 'Initializing PySpark...';
      } else {
        loadingMessage = 'Initializing SQL engine...';
      }
    }

    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-2">{loadingMessage}</div>
          <div className="text-sm text-text-muted">This may take a moment</div>
        </div>
      </div>
    );
  }

  const displayError = error || (needsExecutor ? executorError : null);
  if (displayError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-error mb-4">{displayError}</div>
          <Link
            to={`/${skill}`}
            className="text-primary hover:text-primary-hover transition-colors duration-200"
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
          <div className="text-lg text-text-secondary mb-4">Question not found</div>
          <Link
            to={`/${skill}`}
            className="text-primary hover:text-primary-hover transition-colors duration-200"
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

  // Render tools question types (before quiz check, since quiz is shared with architecture)
  if (isPredictQuestion(currentQuestion)) {
    return <PredictQuestionView question={currentQuestion} trackId={trackId} prevUrl={prevUrl} nextUrl={nextUrl} />;
  }
  if (isTradeoffQuestion(currentQuestion)) {
    return <TradeoffQuestionView question={currentQuestion} trackId={trackId} prevUrl={prevUrl} nextUrl={nextUrl} />;
  }
  if (isIncidentQuestion(currentQuestion)) {
    return <IncidentQuestionView question={currentQuestion} trackId={trackId} prevUrl={prevUrl} nextUrl={nextUrl} />;
  }
  if (isReviewQuestion(currentQuestion)) {
    return <ReviewQuestionView question={currentQuestion} trackId={trackId} prevUrl={prevUrl} nextUrl={nextUrl} />;
  }
  if (isOptimizeQuestion(currentQuestion)) {
    return <OptimizeQuestionView question={currentQuestion} trackId={trackId} prevUrl={prevUrl} nextUrl={nextUrl} />;
  }

  if (isQuizQuestion(currentQuestion)) {
    return <QuizQuestionView question={currentQuestion} trackId={trackId} prevUrl={prevUrl} nextUrl={nextUrl} />;
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
      prevUrl={prevUrl}
      nextUrl={nextUrl}
    />
  );
}
