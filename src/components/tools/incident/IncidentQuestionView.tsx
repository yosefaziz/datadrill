import { useState, useEffect } from 'react';
import { IncidentQuestion } from '@/types';
import { useIncidentStore } from '@/stores/incidentStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useTrackStore } from '@/stores/trackStore';
import { validateIncidentQuestion } from '@/services/validation/IncidentValidator';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionNavButtons } from '@/components/question-view/QuestionNavButtons';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface IncidentQuestionViewProps {
  question: IncidentQuestion;
  trackId: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
}

const PHASE_LABELS = {
  investigate: 'Investigate',
  diagnose: 'Diagnose',
  fix: 'Fix',
  result: 'Result',
} as const;

const PHASE_ORDER = ['investigate', 'diagnose', 'fix', 'result'] as const;

export function IncidentQuestionView({ question, trackId, prevUrl, nextUrl }: IncidentQuestionViewProps) {
  const {
    phase,
    revealedStepIds,
    selectedRootCauseId,
    selectedFixIds,
    validationResult,
    revealStep,
    advancePhase,
    selectRootCause,
    toggleFix,
    setValidationResult,
    reset,
  } = useIncidentStore();
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
    const result = validateIncidentQuestion(
      question,
      revealedStepIds,
      selectedRootCauseId || '',
      selectedFixIds
    );
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
          answer: JSON.stringify({ revealedStepIds, selectedRootCauseId, selectedFixIds }),
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

  const canAdvance = () => {
    if (phase === 'investigate') return revealedStepIds.length > 0;
    if (phase === 'diagnose') return !!selectedRootCauseId;
    if (phase === 'fix') return selectedFixIds.length > 0;
    return false;
  };

  const handleNext = () => {
    if (phase === 'fix') {
      handleSubmit();
    } else {
      advancePhase();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-error/10 rounded-lg ring-1 ring-error/20">
              <div className="text-xs font-medium text-error uppercase tracking-wider mb-1">Alert</div>
              <p className="text-sm text-text-primary">{question.alert}</p>
            </div>
            <div className="prose prose-slate max-w-none prose-invert">
              {question.description && (
                <div
                  className="text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}
            </div>
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

  const renderPhaseContent = () => {
    switch (phase) {
      case 'investigate':
        return (
          <div className="space-y-3">
            <div className="text-sm text-text-secondary mb-4">
              Click on investigation actions to reveal clues ({revealedStepIds.length}/{question.maxInvestigationSteps} budget used)
            </div>
            {question.investigationSteps.map((step) => {
              const isRevealed = revealedStepIds.includes(step.id);
              const atBudget = revealedStepIds.length >= question.maxInvestigationSteps;

              return (
                <button
                  key={step.id}
                  onClick={() => revealStep(step.id, question.maxInvestigationSteps)}
                  disabled={isRevealed || atBudget}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isRevealed
                      ? 'border-primary/50 bg-primary/5'
                      : atBudget
                        ? 'border-border bg-surface opacity-50 cursor-not-allowed'
                        : 'border-border bg-surface hover:border-primary cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isRevealed ? 'bg-primary/20 text-primary' : 'bg-bg-secondary text-text-muted'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary">{step.action}</div>
                      {isRevealed && (
                        <div className="text-sm text-text-secondary mt-2 p-2 bg-bg-secondary rounded">
                          {step.clue}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'diagnose':
        return (
          <div className="space-y-3">
            <div className="text-sm text-text-secondary mb-4">
              Based on your investigation, select the root cause:
            </div>
            {question.rootCauses.map((rc) => {
              const isSelected = selectedRootCauseId === rc.id;
              return (
                <button
                  key={rc.id}
                  onClick={() => selectRootCause(rc.id)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-primary bg-primary' : 'border-border'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <div className="text-sm text-text-primary">{rc.text}</div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'fix':
        return (
          <div className="space-y-3">
            <div className="text-sm text-text-secondary mb-4">
              Select the appropriate fixes (up to {question.maxFixes}):
            </div>
            {question.fixes.map((fix) => {
              const isSelected = selectedFixIds.includes(fix.id);
              return (
                <button
                  key={fix.id}
                  onClick={() => toggleFix(fix.id, question.maxFixes)}
                  role="checkbox"
                  aria-checked={isSelected}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-primary bg-primary' : 'border-border'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-text-primary">{fix.text}</div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'result':
        if (!validationResult) return null;
        return (
          <div className="space-y-6">
            {/* Overall result */}
            <div className={`p-4 rounded-lg ${
              validationResult.passed ? 'bg-success/10 ring-1 ring-success/20' : 'bg-error/10 ring-1 ring-error/20'
            }`}>
              <div className={`text-lg font-semibold ${validationResult.passed ? 'text-success' : 'text-error'}`}>
                {validationResult.passed ? 'Incident Resolved!' : 'Needs Improvement'}
              </div>
            </div>

            {/* Investigation efficiency */}
            <div>
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Investigation Efficiency</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      validationResult.investigationEfficiency >= 0.7 ? 'bg-success' :
                      validationResult.investigationEfficiency >= 0.4 ? 'bg-warning' : 'bg-error'
                    }`}
                    style={{ width: `${Math.round(validationResult.investigationEfficiency * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-text-secondary">
                  {Math.round(validationResult.investigationEfficiency * 100)}%
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {validationResult.stepsRevealed.map((step) => (
                  <div key={step.id} className="flex items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      step.category === 'essential' ? 'bg-success/20 text-success' :
                      step.category === 'helpful' ? 'bg-info/20 text-info' :
                      'bg-bg-secondary text-text-muted'
                    }`}>
                      {step.category}
                    </span>
                    <span className="text-text-secondary">{step.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Root cause */}
            <div>
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Root Cause</div>
              <div className={`p-3 rounded-lg ${
                validationResult.rootCauseCorrect ? 'bg-success/10 ring-1 ring-success/20' : 'bg-error/10 ring-1 ring-error/20'
              }`}>
                <div className={`text-sm font-medium ${validationResult.rootCauseCorrect ? 'text-success' : 'text-error'}`}>
                  {validationResult.rootCauseCorrect ? 'Correct!' : 'Incorrect'}
                </div>
                <div className="text-sm text-text-secondary mt-1">{validationResult.rootCauseFeedback}</div>
              </div>
            </div>

            {/* Fixes */}
            <div>
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                Fixes ({validationResult.fixScore}/{validationResult.maxFixScore} points)
              </div>
              <div className="space-y-2">
                {validationResult.fixResults.map((fix) => (
                  <div key={fix.id} className={`p-3 rounded-lg border-2 ${
                    fix.selected
                      ? fix.correct
                        ? 'border-success bg-success/10'
                        : 'border-error bg-error/10'
                      : fix.correct
                        ? 'border-warning bg-warning/5'
                        : 'border-border bg-surface'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm text-text-primary">{fix.text}</div>
                      {fix.selected && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                          fix.points > 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                        }`}>
                          {fix.points > 0 ? '+' : ''}{fix.points}pt
                        </span>
                      )}
                    </div>
                    {fix.feedback && (
                      <div className="text-xs text-text-secondary mt-1 italic">{fix.feedback}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
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
        {/* Left Panel - Alert & Description */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-error/20 text-error">
                  Incident
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

        {/* Right Panel - Phase-based interaction */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          {/* Phase stepper */}
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {PHASE_ORDER.map((p, idx) => {
                  const phaseIdx = PHASE_ORDER.indexOf(phase);
                  const isActive = p === phase;
                  const isCompleted = idx < phaseIdx;

                  return (
                    <div key={p} className="flex items-center">
                      <div className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : isCompleted
                            ? 'bg-success/20 text-success'
                            : 'bg-bg-secondary text-text-muted'
                      }`}>
                        {PHASE_LABELS[p]}
                      </div>
                      {idx < PHASE_ORDER.length - 1 && (
                        <div className={`w-4 h-px mx-1 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {phase === 'investigate' && `Investigation budget: ${revealedStepIds.length}/${question.maxInvestigationSteps}`}
                {phase === 'diagnose' && 'Select the root cause'}
                {phase === 'fix' && `Select fixes (${selectedFixIds.length}/${question.maxFixes})`}
                {phase === 'result' && (validationResult?.passed ? 'Incident resolved!' : 'Review the results')}
              </div>
              {phase !== 'result' && (
                <button
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    canAdvance()
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  }`}
                >
                  {phase === 'fix' ? 'Submit' : 'Next'}
                </button>
              )}
              {phase === 'result' && validationResult && !validationResult.passed && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-accent text-white hover:bg-accent-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderPhaseContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
