import { useState, useEffect } from 'react';
import { OptimizeQuestion } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useTrackStore } from '@/stores/trackStore';
import { validateOptimizeQuestion } from '@/services/validation/OptimizeValidator';
import { OptimizeValidationResult } from '@/types';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionNavButtons } from '@/components/question-view/QuestionNavButtons';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface OptimizeQuestionViewProps {
  question: OptimizeQuestion;
  trackId: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
}

export function OptimizeQuestionView({ question, trackId, prevUrl, nextUrl }: OptimizeQuestionViewProps) {
  const { code, setCode } = useEditorStore();
  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);
  const markQuestionCompleted = useTrackStore((s) => s.markQuestionCompleted);
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const [validationResult, setValidationResult] = useState<OptimizeValidationResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showOptHints, setShowOptHints] = useState(false);
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted: hasSubmittedForGate } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  useEffect(() => {
    setCode(question.slowQuery);
    setValidationResult(null);
    setIsSubmitted(false);
    setActiveTab('description');
    setShowOptHints(false);
  }, [question.id, question.slowQuery, setCode]);

  const handleSubmit = async () => {
    const result = validateOptimizeQuestion(question, code);
    setValidationResult(result);
    setIsSubmitted(true);

    if (result.passed && trackId) {
      markQuestionCompleted(trackId, question.id);
    }

    try {
      await submitAnswer(
        {
          question_id: question.id,
          skill: question.skill,
          difficulty: question.difficulty,
          answer: code,
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
    setCode(question.slowQuery);
    setValidationResult(null);
    setIsSubmitted(false);
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
            <div className="rounded-lg overflow-hidden ring-1 ring-white/10">
              <div className="px-3 py-2 bg-bg-secondary text-xs font-medium text-text-muted uppercase tracking-wider">
                Slow {question.language === 'python' ? 'PySpark' : 'SQL'} Code (Original)
              </div>
              <pre className="p-4 bg-[#1e1e1e] text-sm text-text-primary overflow-x-auto font-mono leading-relaxed">
                <code>{question.slowQuery}</code>
              </pre>
            </div>
            {question.tables.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Table Info</div>
                {question.tables.map((table) => (
                  <div key={table.name} className="rounded-lg overflow-hidden ring-1 ring-white/10">
                    <div className="px-3 py-2 bg-bg-secondary text-xs font-medium text-text-muted">
                      {table.name}
                    </div>
                    <pre className="p-3 bg-[#1e1e1e] text-xs text-text-primary overflow-x-auto font-mono">
                      {table.visibleData}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

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
        {/* Left Panel - Description & Slow Code */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                  Optimize
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

        {/* Right Panel - Editor */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm text-text-secondary">
                  {isSubmitted
                    ? validationResult?.passed
                      ? 'Optimized!'
                      : 'Needs improvement'
                    : 'Write the optimized version'}
                </div>
                {!isSubmitted && (
                  <button
                    onClick={() => setShowOptHints(!showOptHints)}
                    className="text-xs text-primary hover:text-primary-hover transition-colors"
                  >
                    {showOptHints ? 'Hide tips' : 'Show optimization tips'}
                  </button>
                )}
              </div>
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-white hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Submit
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

          {showOptHints && !isSubmitted && (
            <div className="px-6 py-3 border-b border-border bg-info/5">
              <div className="text-xs font-medium text-info mb-1">Optimization Tips</div>
              <ul className="text-xs text-text-secondary space-y-1">
                {question.optimizationHints.map((hint, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-info mt-0.5 flex-shrink-0">-</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <textarea
              value={code}
              onChange={(e) => !isSubmitted && setCode(e.target.value)}
              readOnly={isSubmitted}
              className="w-full h-full min-h-[300px] p-4 bg-[#1e1e1e] text-sm text-text-primary font-mono leading-relaxed resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Validation Results */}
          {isSubmitted && validationResult && (
            <div className="px-6 py-4 border-t border-border">
              <div className={`text-sm font-medium mb-2 ${
                validationResult.passed ? 'text-success' : 'text-error'
              }`}>
                {validationResult.feedback}
              </div>
              {validationResult.antiPatternMatches.length > 0 && (
                <div className="space-y-2 mt-3">
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Anti-patterns found</div>
                  {validationResult.antiPatternMatches.map((match, idx) => (
                    <div key={idx} className="p-2 bg-error/10 rounded text-xs text-error">
                      {match.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
