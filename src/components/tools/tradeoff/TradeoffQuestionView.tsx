import { useState, useEffect } from 'react';
import { TradeoffQuestion } from '@/types';
import { useTradeoffStore } from '@/stores/tradeoffStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useTrackStore } from '@/stores/trackStore';
import { validateTradeoffQuestion } from '@/services/validation/TradeoffValidator';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionNavButtons } from '@/components/question-view/QuestionNavButtons';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface TradeoffQuestionViewProps {
  question: TradeoffQuestion;
  trackId: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
}

export function TradeoffQuestionView({ question, trackId, prevUrl, nextUrl }: TradeoffQuestionViewProps) {
  const {
    selectedOptionId,
    selectedJustificationIds,
    validationResult,
    isSubmitted,
    selectOption,
    toggleJustification,
    setValidationResult,
    reset,
  } = useTradeoffStore();
  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);
  const markQuestionCompleted = useTrackStore((s) => s.markQuestionCompleted);
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted: hasSubmittedForGate } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  useEffect(() => {
    reset();
    setActiveTab('description');
  }, [question.id, reset]);

  const handleSubmit = async () => {
    if (!selectedOptionId) return;
    const result = validateTradeoffQuestion(question, selectedOptionId, selectedJustificationIds);
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
          answer: JSON.stringify({ selectedOptionId, selectedJustificationIds }),
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
          <div className="space-y-4">
            <div className="prose prose-slate max-w-none prose-invert">
              {question.description && (
                <div
                  className="text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}
            </div>
            <div className="p-4 bg-bg-secondary rounded-lg ring-1 ring-white/10">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Scenario</div>
              <div className="text-text-primary whitespace-pre-wrap">{question.prompt}</div>
            </div>
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

  const canSubmit = !!selectedOptionId && selectedJustificationIds.length > 0;

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-start justify-between">
        <Breadcrumb
          items={[
            { label: 'Tools & Frameworks', href: '/tools' },
            { label: question.title },
          ]}
        />
        <QuestionNavButtons prevUrl={prevUrl} nextUrl={nextUrl} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
        {/* Left Panel - Scenario */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  Tradeoff
                </span>
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

        {/* Right Panel - Options & Justifications */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {isSubmitted
                  ? validationResult?.passed
                    ? 'Correct!'
                    : 'Incorrect'
                  : !selectedOptionId
                    ? 'Step 1: Choose an option'
                    : `Step 2: Select justifications (${selectedJustificationIds.length}/${question.maxJustifications})`}
              </div>
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    canSubmit
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
            {/* Options */}
            <div className="space-y-3 mb-6" role="radiogroup" aria-label="Select the best option">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Options</div>
              {question.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const optionResult = isSubmitted ? validationResult : null;

                let borderColor = 'border-border';
                let bgColor = 'bg-surface';
                let textColor = 'text-text-primary';

                if (isSubmitted) {
                  if (option.correct) {
                    borderColor = 'border-success';
                    bgColor = isSelected ? 'bg-success/10' : 'bg-success/5';
                    textColor = 'text-success';
                  } else if (isSelected) {
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
                    key={option.id}
                    onClick={() => selectOption(option.id)}
                    disabled={isSubmitted}
                    role="radio"
                    aria-checked={isSelected}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${borderColor} ${bgColor} ${
                      isSubmitted ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? isSubmitted
                              ? option.correct ? 'border-success bg-success' : 'border-error bg-error'
                              : 'border-primary bg-primary'
                            : isSubmitted && option.correct
                              ? 'border-success'
                              : 'border-border'
                        }`}
                        aria-hidden="true"
                      >
                        {(isSelected || (isSubmitted && option.correct)) && (
                          <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-white' : 'bg-success'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${textColor}`}>{option.name}</div>
                        <div className="text-sm text-text-secondary mt-1">{option.description}</div>
                        {isSubmitted && isSelected && optionResult && (
                          <div className="text-sm text-text-secondary mt-2 italic">{optionResult.optionFeedback}</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Justifications - shown after option selection */}
            {(selectedOptionId || isSubmitted) && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Justifications {!isSubmitted && `(select up to ${question.maxJustifications})`}
                </div>
                {question.justifications.map((justification) => {
                  const isSelected = selectedJustificationIds.includes(justification.id);
                  const jResult = validationResult?.justificationResults.find((r) => r.id === justification.id);

                  let borderColor = 'border-border';
                  let bgColor = 'bg-surface';

                  if (isSubmitted && jResult) {
                    if (jResult.selected && jResult.points > 0) {
                      borderColor = 'border-success';
                      bgColor = 'bg-success/10';
                    } else if (jResult.selected && jResult.points <= 0) {
                      borderColor = 'border-error';
                      bgColor = 'bg-error/10';
                    } else if (!jResult.selected && jResult.feedback) {
                      borderColor = 'border-warning';
                      bgColor = 'bg-warning/5';
                    }
                  } else if (isSelected) {
                    borderColor = 'border-primary';
                    bgColor = 'bg-primary/10';
                  }

                  return (
                    <button
                      key={justification.id}
                      onClick={() => toggleJustification(justification.id, question.maxJustifications)}
                      disabled={isSubmitted}
                      role="checkbox"
                      aria-checked={isSelected}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${borderColor} ${bgColor} ${
                        isSubmitted ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? isSubmitted
                                ? jResult && jResult.points > 0
                                  ? 'border-success bg-success'
                                  : 'border-error bg-error'
                                : 'border-primary bg-primary'
                              : 'border-border'
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-text-primary">{justification.text}</div>
                          {isSubmitted && jResult?.feedback && (
                            <div className="text-xs text-text-secondary mt-1 italic">{jResult.feedback}</div>
                          )}
                        </div>
                        {isSubmitted && jResult && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                            jResult.points > 0 ? 'bg-success/20 text-success' : jResult.points < 0 ? 'bg-error/20 text-error' : 'bg-bg-secondary text-text-muted'
                          }`}>
                            {jResult.points > 0 ? '+' : ''}{jResult.points}pt
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {isSubmitted && validationResult && (
                  <div className="mt-4 p-4 bg-bg-secondary rounded-lg ring-1 ring-white/10">
                    <h4 className="font-semibold text-text-primary mb-1">Score</h4>
                    <p className="text-sm text-text-secondary">
                      Justification score: {validationResult.justificationScore}/{validationResult.maxJustificationScore}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
