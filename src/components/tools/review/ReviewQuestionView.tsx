import { useState, useEffect } from 'react';
import { ReviewQuestion } from '@/types';
import { useReviewStore } from '@/stores/reviewStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useTrackStore } from '@/stores/trackStore';
import { validateReviewQuestion } from '@/services/validation/ReviewValidator';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionNavButtons } from '@/components/question-view/QuestionNavButtons';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface ReviewQuestionViewProps {
  question: ReviewQuestion;
  trackId: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
}

const SEVERITY_CONFIG = {
  bug: {
    label: 'Bug',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    activeBg: 'bg-error/20',
    activeText: 'text-error',
    cardBorder: 'border-l-error',
  },
  warning: {
    label: 'Warn',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    activeBg: 'bg-warning/20',
    activeText: 'text-warning',
    cardBorder: 'border-l-warning',
  },
  minor: {
    label: 'Minor',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    activeBg: 'bg-info/20',
    activeText: 'text-info',
    cardBorder: 'border-l-info',
  },
  ok: {
    label: 'OK',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    activeBg: 'bg-success/15',
    activeText: 'text-success',
    cardBorder: 'border-l-success',
  },
} as const;

const SEVERITY_OPTIONS = Object.keys(SEVERITY_CONFIG) as (keyof typeof SEVERITY_CONFIG)[];

export function ReviewQuestionView({ question, trackId, prevUrl, nextUrl }: ReviewQuestionViewProps) {
  const {
    selectedIssueIds,
    issueSeverities,
    validationResult,
    isSubmitted,
    setSeverity,
    setValidationResult,
    reset,
  } = useReviewStore();
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
    const result = validateReviewQuestion(question, selectedIssueIds, issueSeverities);
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
          answer: JSON.stringify({ selectedIssueIds, issueSeverities }),
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
            <div className="p-3 bg-bg-secondary rounded-lg ring-1 ring-white/10">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Context</div>
              <p className="text-sm text-text-secondary">{question.context}</p>
            </div>
            <div className="rounded-lg overflow-hidden ring-1 ring-white/10">
              <div className="px-3 py-2 bg-bg-secondary text-xs font-medium text-text-muted uppercase tracking-wider">
                {question.language === 'python' ? 'PySpark' : 'SQL'} Code
              </div>
              <pre className="p-4 bg-[#1e1e1e] text-sm text-text-primary overflow-x-auto font-mono leading-relaxed">
                <code>{question.code}</code>
              </pre>
            </div>
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

  const hasSelection = selectedIssueIds.length > 0;

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-start justify-between">
        <Breadcrumb
          items={[
            { label: 'Tools & Frameworks', href: '/tools' },
            { label: question.title },
          ]}
        />
        <div className="flex items-center gap-3">
          <TimerWidget />
          <QuestionNavButtons prevUrl={prevUrl} nextUrl={nextUrl} />
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
        {/* Left Panel - Code & Context */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent/20 text-accent">
                  Code Review
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
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

        {/* Right Panel - Issue Checklist */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {isSubmitted
                  ? validationResult?.passed
                    ? `Passed! Score: ${validationResult.totalScore}/${validationResult.maxScore}`
                    : `Score: ${validationResult?.totalScore ?? 0}/${validationResult?.maxScore ?? 0}`
                  : `Select issues and classify severity (${selectedIssueIds.length} selected)`}
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
                  Submit Review
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
            <div className="space-y-2.5" role="group" aria-label="Flag issues found in the code">
              {question.issues.map((issue) => {
                const isSelected = selectedIssueIds.includes(issue.id);
                const severity = issueSeverities[issue.id] as keyof typeof SEVERITY_CONFIG | undefined;
                const config = severity ? SEVERITY_CONFIG[severity] : null;
                const result = validationResult?.issueResults.find((r) => r.id === issue.id);

                // Card left-border accent when selected
                let leftBorder = 'border-l-transparent';
                if (!isSubmitted && isSelected && config) {
                  leftBorder = config.cardBorder;
                } else if (isSubmitted && result) {
                  if (result.isReal) {
                    leftBorder = result.wasSelected && result.selectedSeverity !== 'ok'
                      ? 'border-l-success'    // correctly flagged
                      : 'border-l-warning';   // missed or marked OK
                  } else {
                    leftBorder = !result.wasSelected || result.selectedSeverity === 'ok'
                      ? 'border-l-success'    // correctly identified as OK
                      : 'border-l-error';     // false positive
                  }
                }

                return (
                  <div
                    key={issue.id}
                    className={`rounded-lg border-l-[3px] bg-bg-secondary/50 ring-1 ring-white/5 transition-all ${leftBorder}`}
                  >
                    <div className="p-3.5 pb-2.5">
                      <div className="text-[13px] leading-relaxed text-text-primary">{issue.text}</div>
                    </div>

                    {/* Severity segmented control - before submit */}
                    {!isSubmitted && (
                      <div className="px-3.5 pb-3">
                        <div className="flex rounded-md overflow-hidden ring-1 ring-white/10" role="radiogroup" aria-label="Issue severity">
                          {SEVERITY_OPTIONS.map((sev, idx) => {
                            const sevConfig = SEVERITY_CONFIG[sev];
                            const isActive = isSelected && severity === sev;
                            return (
                              <button
                                key={sev}
                                onClick={() => setSeverity(issue.id, sev)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                                  idx > 0 ? 'border-l border-white/10' : ''
                                } ${
                                  isActive
                                    ? `${sevConfig.activeBg} ${sevConfig.activeText}`
                                    : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
                                }`}
                                role="radio"
                                aria-checked={isActive}
                              >
                                {sevConfig.icon}
                                {sevConfig.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Result feedback - after submit */}
                    {isSubmitted && result && (
                      <div className="px-3.5 pb-3">
                        <div className="flex items-center gap-2">
                          {/* Show what the user picked */}
                          {result.wasSelected && result.selectedSeverity && (
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              result.isReal
                                ? result.selectedSeverity === 'ok'
                                  ? 'bg-error/20 text-error line-through'      // marked OK but was real
                                  : result.selectedSeverity === result.correctSeverity
                                    ? 'bg-success/20 text-success'             // correct severity
                                    : 'bg-warning/20 text-warning'             // wrong severity
                                : result.selectedSeverity === 'ok'
                                  ? 'bg-success/20 text-success'               // correctly marked OK
                                  : 'bg-error/20 text-error line-through'      // false positive
                            }`}>
                              {SEVERITY_CONFIG[result.selectedSeverity as keyof typeof SEVERITY_CONFIG]?.label ?? result.selectedSeverity}
                            </span>
                          )}
                          {/* Show correct answer if user was wrong */}
                          {result.isReal && result.selectedSeverity !== result.correctSeverity && result.correctSeverity && (
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              SEVERITY_CONFIG[result.correctSeverity as keyof typeof SEVERITY_CONFIG]?.activeBg ?? ''
                            } ${
                              SEVERITY_CONFIG[result.correctSeverity as keyof typeof SEVERITY_CONFIG]?.activeText ?? ''
                            }`}>
                              {SEVERITY_CONFIG[result.correctSeverity as keyof typeof SEVERITY_CONFIG]?.label ?? result.correctSeverity}
                            </span>
                          )}
                          {!result.isReal && result.selectedSeverity !== 'ok' && (
                            <span className="text-xs px-2 py-0.5 rounded font-medium bg-success/20 text-success">
                              OK
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1.5 italic">{result.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
