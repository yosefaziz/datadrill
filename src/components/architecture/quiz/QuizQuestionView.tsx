import { useState, useEffect, useMemo } from 'react';
import { QuizQuestion } from '@/types';
import { useQuizStore } from '@/stores/quizStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useTrackStore } from '@/stores/trackStore';
import { validateQuizQuestion } from '@/services/validation/QuizValidator';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionNavButtons } from '@/components/question-view/QuestionNavButtons';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface QuizQuestionViewProps {
  question: QuizQuestion;
  trackId: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
}

export function QuizQuestionView({ question, trackId, prevUrl, nextUrl }: QuizQuestionViewProps) {
  const {
    selectedAnswers,
    validationResult,
    isSubmitted,
    toggleAnswer,
    setValidationResult,
    reset,
    shuffleKey,
  } = useQuizStore();
  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);
  const markQuestionCompleted = useTrackStore((s) => s.markQuestionCompleted);
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted: hasSubmittedForGate } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  const shuffledAnswers = useMemo(() => {
    const answers = [...question.answers];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }, [question.id, shuffleKey]);

  useEffect(() => {
    reset();
    setActiveTab('description');
  }, [question.id, reset]);

  const handleSubmit = async () => {
    const result = validateQuizQuestion(question, selectedAnswers);
    setValidationResult(result);

    if (result.passed && trackId) {
      markQuestionCompleted(trackId, question.id);
    }

    try {
      await submitAnswer(
        {
          question_id: question.id,
          skill: question.skill,
          difficulty: question.difficulty,
          answer: JSON.stringify(selectedAnswers),
          passed: result.passed,
          result_meta: result as unknown as Record<string, unknown>,
        },
        user?.id || null
      );
    } catch {
      // Non-critical
    }
  };

  const handleReset = () => {
    reset();
  };

  const handleTabChange = (tab: QuestionTab) => {
    if (tab === 'hints' || tab === 'discussion') {
      if (!requireAuth()) return;
    }
    if (tab === 'discussion' && !hasSubmittedForGate) return;
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose prose-slate max-w-none prose-invert">
            <p className="text-lg text-text-primary whitespace-pre-wrap">
              {question.question}
            </p>
            {question.description && (
              <div
                className="text-text-secondary mt-4"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />
            )}
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

  const hasSelection = selectedAnswers.length > 0;

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-start justify-between">
        <Breadcrumb
          items={[
            { label: question.skill === 'tools' ? 'Tools & Frameworks' : 'Architecture', href: `/${question.skill}` },
            { label: question.title },
          ]}
        />
        <QuestionNavButtons prevUrl={prevUrl} nextUrl={nextUrl} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
        {/* Left Panel - Question */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-info/20 text-info">
                  Quiz
                </span>
                {question.multiSelect && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-warning/20 text-warning">
                    Multiple Answers
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TimerWidget />
                <BugReportPopover questionId={question.id} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{question.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  question.difficulty === 'Easy'
                    ? 'bg-success/20 text-success'
                    : question.difficulty === 'Medium'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-error/20 text-error'
                }`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>

          <QuestionTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            hasHints={hints.length > 0}
            isAuthenticated={isAuthenticated}
            hasSubmitted={hasSubmittedForGate}
            showSolutions={false}
          />
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel - Answers */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {isSubmitted
                  ? validationResult?.passed
                    ? 'Correct!'
                    : 'Incorrect'
                  : question.multiSelect
                    ? 'Select all that apply'
                    : 'Select one answer'}
              </div>
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!hasSelection}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    hasSelection
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : !validationResult?.passed ? (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-accent text-white hover:bg-accent-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Try Again
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div
              className="space-y-3"
              role={question.multiSelect ? 'group' : 'radiogroup'}
              aria-label={question.multiSelect ? 'Select all correct answers' : 'Select the correct answer'}
            >
              {shuffledAnswers.map((answer) => {
                const isSelected = selectedAnswers.includes(answer.id);
                const result = validationResult?.answerResults.find(
                  (r) => r.answerId === answer.id
                );

                let borderColor = 'border-border';
                let bgColor = 'bg-surface';
                let textColor = 'text-text-primary';

                if (isSubmitted && result) {
                  if (result.isCorrect) {
                    borderColor = 'border-success';
                    bgColor = result.wasSelected ? 'bg-success/10' : 'bg-success/5';
                    textColor = 'text-success';
                  } else if (result.wasSelected) {
                    borderColor = 'border-error';
                    bgColor = 'bg-error/10';
                    textColor = 'text-error';
                  }
                } else if (isSelected) {
                  borderColor = 'border-primary';
                  bgColor = 'bg-primary/10';
                }

                return (
                  <button
                    key={answer.id}
                    onClick={() => toggleAnswer(answer.id, question.multiSelect)}
                    disabled={isSubmitted}
                    role={question.multiSelect ? 'checkbox' : 'radio'}
                    aria-checked={isSelected}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${borderColor} ${bgColor} ${
                      isSubmitted ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 ${question.multiSelect ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? isSubmitted
                              ? result?.isCorrect
                                ? 'border-success bg-success'
                                : 'border-error bg-error'
                              : 'border-primary bg-primary'
                            : isSubmitted && result?.isCorrect
                              ? 'border-success'
                              : 'border-border'
                        }`}
                        aria-hidden="true"
                      >
                        {question.multiSelect ? (
                          // Checkbox style - checkmark for multi-select
                          (isSelected || (isSubmitted && result?.isCorrect)) && (
                            <svg
                              className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-success'}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )
                        ) : (
                          // Radio style - filled dot for single-select
                          (isSelected || (isSubmitted && result?.isCorrect)) && (
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isSelected
                                  ? 'bg-white'
                                  : 'bg-success'
                              }`}
                            />
                          )
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${textColor}`}>{answer.text}</div>
                        {isSubmitted && result?.explanation && (
                          <div className="text-sm text-text-secondary mt-2 italic">
                            {result.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {isSubmitted && validationResult?.overallExplanation && (
              <div className="mt-6 p-4 bg-bg-secondary rounded-lg ring-1 ring-white/10">
                <h4 className="font-semibold text-text-primary mb-2">Explanation</h4>
                <p className="text-text-secondary">{validationResult.overallExplanation}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
