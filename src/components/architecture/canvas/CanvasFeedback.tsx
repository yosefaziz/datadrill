import { CanvasValidationResult } from '@/types';
import { getComponentById } from '@/data/toolbox';

interface CanvasFeedbackProps {
  result: CanvasValidationResult;
  onReset: () => void;
}

export function CanvasFeedback({ result, onReset }: CanvasFeedbackProps) {
  const statusStyles = {
    correct: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      icon: 'text-green-500',
      text: 'text-green-700',
    },
    partial: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      icon: 'text-yellow-500',
      text: 'text-yellow-700',
    },
    wrong: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      icon: 'text-red-500',
      text: 'text-red-700',
    },
    missing: {
      bg: 'bg-slate-50',
      border: 'border-slate-300',
      icon: 'text-slate-400',
      text: 'text-slate-600',
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
    <div className="p-6 space-y-6">
      {/* Score summary */}
      <div
        className={`p-4 rounded-lg ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-lg font-semibold ${result.passed ? 'text-green-800' : 'text-red-800'}`}
            >
              {result.passed ? 'Pipeline Design Passed!' : 'Pipeline Needs Improvement'}
            </h3>
            <p className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed
                ? 'Your architecture choices are sound.'
                : 'Review the feedback below to improve your design.'}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}
            >
              {result.totalScore}/{result.maxScore}
            </div>
            <div className="text-sm text-slate-500">{scorePercentage}%</div>
          </div>
        </div>
      </div>

      {/* Step-by-step feedback */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
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
                    <div className="font-medium text-slate-800">
                      Step {index + 1}: {stepResult.stepName}
                    </div>
                    <div className="text-sm font-medium text-slate-600">
                      +{stepResult.points} pts
                    </div>
                  </div>
                  {component && (
                    <div className="text-sm text-slate-600 mt-1">
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
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
