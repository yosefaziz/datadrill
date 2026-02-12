import { useState, useEffect } from 'react';
import { ConstraintsQuestion } from '@/types';
import { useArchitectureStore, ArchitecturePhase } from '@/stores/architectureStore';
import { QuestionSelectionPhase } from './QuestionSelectionPhase';
import { ArchitectureSelectionPhase } from './ArchitectureSelectionPhase';
import { ArchitectureFeedback } from './ArchitectureFeedback';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface ArchitectureQuestionViewProps {
  question: ConstraintsQuestion;
}

const phases: ArchitecturePhase[] = ['questions', 'architecture', 'feedback'];
const phaseLabels: Record<ArchitecturePhase, string> = {
  questions: 'Ask Questions',
  architecture: 'Choose Architecture',
  feedback: 'Review Feedback',
};

export function ArchitectureQuestionView({ question }: ArchitectureQuestionViewProps) {
  const { phase, setPhase, reset, selectedQuestionIds, validationResult } = useArchitectureStore();
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  // Reset state when question changes
  useEffect(() => {
    reset();
    setActiveTab('description');
  }, [question.id, reset]);

  const currentPhaseIndex = phases.indexOf(phase);

  // Determine which phases are accessible (can navigate back to)
  const canNavigateToPhase = (targetPhase: ArchitecturePhase): boolean => {
    const targetIndex = phases.indexOf(targetPhase);

    // Can always go to current phase
    if (targetPhase === phase) return false;

    // Can go back to previous phases if they've been completed
    if (targetIndex < currentPhaseIndex) {
      // Can go back to questions if we've moved past it
      if (targetPhase === 'questions') return true;
      // Can go back to architecture if we've moved past it and questions were selected
      if (targetPhase === 'architecture' && selectedQuestionIds.length === question.maxQuestions) return true;
    }

    // Can go forward to architecture if questions are complete
    if (targetPhase === 'architecture' && phase === 'questions' && selectedQuestionIds.length === question.maxQuestions) {
      return true;
    }

    // Can go to feedback only if we have a validation result
    if (targetPhase === 'feedback' && validationResult) return true;

    return false;
  };

  const handleTabChange = (tab: QuestionTab) => {
    if (tab === 'hints' || tab === 'discussion') {
      if (!requireAuth()) return;
    }
    if (tab === 'discussion' && !hasSubmitted) return;
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose prose-slate max-w-none prose-invert">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Scenario</h3>
            <p className="text-text-secondary whitespace-pre-wrap">{question.prompt}</p>

            {question.guidance && (
              <>
                <h3 className="text-lg font-semibold mt-6 mb-3 text-text-primary">Guidance</h3>
                <div
                  className="text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: question.guidance }}
                />
              </>
            )}
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmitted} />;
    }
  };

  const handlePhaseClick = (targetPhase: ArchitecturePhase) => {
    if (canNavigateToPhase(targetPhase)) {
      setPhase(targetPhase);
    }
  };

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <Breadcrumb
        items={[
          { label: 'Architecture', href: '/architecture' },
          { label: question.title },
        ]}
      />
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
        {/* Left Panel - Question Description */}
        <div className="w-full lg:w-2/5 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-text-primary">{question.title}</h1>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TimerWidget />
                <BugReportPopover questionId={question.id} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
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
            hasSubmitted={hasSubmitted}
            showSolutions={false}
          />
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel - Interactive Area */}
        <div className="w-full lg:w-3/5 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          {/* Phase Indicator */}
          <div className="px-6 py-3 border-b border-border bg-bg-secondary">
            <div className="flex items-center gap-4">
              {phases.map((p, idx) => {
                const isCurrentPhase = phase === p;
                const isCompletedPhase = idx < currentPhaseIndex;
                const isClickable = canNavigateToPhase(p);

                return (
                  <div key={p} className="flex items-center gap-2">
                    <button
                      onClick={() => handlePhaseClick(p)}
                      disabled={!isClickable}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCurrentPhase
                          ? 'bg-primary text-white'
                          : isCompletedPhase
                            ? 'bg-success text-white'
                            : 'bg-border text-text-muted'
                      } ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                      {isCompletedPhase ? (
                        <svg
                          className="w-4 h-4"
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
                      ) : (
                        idx + 1
                      )}
                    </button>
                    <button
                      onClick={() => handlePhaseClick(p)}
                      disabled={!isClickable}
                      className={`text-sm transition-colors ${
                        isCurrentPhase ? 'text-text-primary font-medium' : 'text-text-muted'
                      } ${isClickable ? 'cursor-pointer hover:text-text-primary' : ''}`}
                    >
                      {phaseLabels[p]}
                    </button>
                    {idx < 2 && (
                      <div className="w-8 h-px bg-border ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase Content */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {phase === 'questions' && <QuestionSelectionPhase question={question} />}
            {phase === 'architecture' && (
              <ArchitectureSelectionPhase question={question} />
            )}
            {phase === 'feedback' && <ArchitectureFeedback />}
          </div>
        </div>
      </div>
    </div>
  );
}
