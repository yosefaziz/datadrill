import { CanvasValidationResult } from '@/types';
import { getComponentById } from '@/data/toolbox';

interface CanvasFeedbackProps {
  result: CanvasValidationResult;
  onReset: () => void;
}

export function CanvasFeedback({ result, onReset }: CanvasFeedbackProps) {
  const statusStyles = {
    correct: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: 'text-success',
      text: 'text-success',
    },
    partial: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: 'text-warning',
      text: 'text-warning',
    },
    wrong: {
      bg: 'bg-error/10',
      border: 'border-error/30',
      icon: 'text-error',
      text: 'text-error',
    },
    missing: {
      bg: 'bg-bg-secondary',
      border: 'border-border',
      icon: 'text-text-muted',
      text: 'text-text-secondary',
    },
  };

  const statusIcons = {
    correct: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    partial: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    wrong: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    missing: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const scorePercentage = Math.round((result.totalScore / result.maxScore) * 100);

  return (
    <div className="p-6 space-y-6 overflow-y-auto" role="region" aria-label="Pipeline feedback">
      {/* Score summary */}
      <div
        className={`p-4 rounded-lg ${result.passed ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-lg font-semibold ${result.passed ? 'text-success' : 'text-error'}`}
            >
              {result.passed ? 'Pipeline Design Passed!' : 'Pipeline Needs Improvement'}
            </h3>
            <p className={`text-sm ${result.passed ? 'text-success' : 'text-error'}`}>
              {result.passed
                ? 'Your architecture choices are sound.'
                : 'Review the feedback below to improve your design.'}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${result.passed ? 'text-success' : 'text-error'}`}
            >
              {result.totalScore}/{result.maxScore}
            </div>
            <div className="text-sm text-text-secondary">{scorePercentage}%</div>
          </div>
        </div>
      </div>

      {/* Step-by-step feedback */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
          Step-by-Step Feedback
        </h3>
        {result.stepResults.map((stepResult, index) => {
          const styles = statusStyles[stepResult.status];
          const icon = statusIcons[stepResult.status];
          const component = stepResult.selectedComponent
            ? getComponentById(stepResult.selectedComponent)
            : null;

          return (
            <div
              key={stepResult.stepId}
              className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${styles.icon}`}>{icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-text-primary">
                      Step {index + 1}: {stepResult.stepName}
                    </div>
                    <div className="text-sm font-medium text-text-secondary">
                      +{stepResult.points} pts
                    </div>
                  </div>
                  {component && (
                    <div className="text-sm text-text-secondary mt-1">
                      Selected: <span className="font-medium">{component.name}</span>
                    </div>
                  )}
                  <p className={`text-sm mt-2 ${styles.text}`}>{stepResult.feedback}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Try again button */}
      <div className="pt-4">
        <button
          onClick={onReset}
          className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
