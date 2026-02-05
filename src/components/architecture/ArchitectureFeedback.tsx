import { useArchitectureStore } from '@/stores/architectureStore';
import { Link } from 'react-router-dom';

export function ArchitectureFeedback() {
  const { validationResult, reset, setPhase } = useArchitectureStore();

  if (!validationResult) {
    return <div className="p-6 text-text-secondary">No results available.</div>;
  }

  const {
    passed,
    totalScore,
    questionScores,
    revealedConstraints,
    architectureCorrect,
    architectureFeedback,
    missedCrucialQuestions,
    irrelevantQuestionsSelected,
  } = validationResult;

  return (
    <div className="p-6 overflow-y-auto" role="region" aria-label="Architecture feedback">
      {/* Overall Result */}
      <div
        className={`mb-6 p-4 rounded-lg border-2 ${
          passed
            ? 'bg-success/10 border-success/30'
            : 'bg-error/10 border-error/30'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{passed ? '✓' : '✗'}</span>
          <div>
            <div className={`text-xl font-bold ${passed ? 'text-success' : 'text-error'}`}>
              {passed ? 'Great Job!' : 'Not Quite Right'}
            </div>
            <div className={`text-sm ${passed ? 'text-success' : 'text-error'}`}>
              Total Score: {totalScore} points
            </div>
          </div>
        </div>
      </div>

      {/* Question Scores */}
      <div className="mb-6">
        <h3 className="font-semibold text-text-primary mb-3">Question Scoring Breakdown</h3>
        <div className="space-y-2">
          {questionScores.map((qs) => (
            <div
              key={qs.questionId}
              className={`p-3 rounded-lg flex justify-between items-center ${
                qs.points > 0
                  ? 'bg-success/10 border border-success/20'
                  : qs.points < 0
                    ? 'bg-error/10 border border-error/20'
                    : 'bg-bg-secondary border border-border'
              }`}
            >
              <div>
                <div className="text-sm text-text-primary">{qs.questionText}</div>
                <div
                  className={`text-xs mt-1 ${
                    qs.category === 'crucial'
                      ? 'text-success'
                      : qs.category === 'helpful'
                        ? 'text-info'
                        : 'text-error'
                  }`}
                >
                  {qs.category.charAt(0).toUpperCase() + qs.category.slice(1)} question
                </div>
              </div>
              <div
                className={`font-bold ${
                  qs.points > 0 ? 'text-success' : qs.points < 0 ? 'text-error' : 'text-text-secondary'
                }`}
              >
                {qs.points > 0 ? '+' : ''}
                {qs.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revealed Constraints */}
      {revealedConstraints.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-3">Constraints You Discovered</h3>
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <ul className="space-y-1">
              {revealedConstraints.map((rc, idx) => (
                <li key={idx} className="text-info flex items-center gap-2">
                  <span className="text-info/70">•</span>
                  <span className="font-medium capitalize">{rc.constraint}:</span>
                  <span>{rc.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Architecture Feedback */}
      <div className="mb-6">
        <h3 className="font-semibold text-text-primary mb-3">Architecture Choice</h3>
        <div
          className={`p-4 rounded-lg border ${
            architectureCorrect
              ? 'bg-success/10 border-success/20'
              : 'bg-warning/10 border-warning/20'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">{architectureCorrect ? '✓' : '!'}</span>
            <p className={architectureCorrect ? 'text-success' : 'text-warning'}>
              {architectureFeedback}
            </p>
          </div>
        </div>
      </div>

      {/* Missed Crucial Questions */}
      {missedCrucialQuestions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-3">
            Crucial Questions You Missed
          </h3>
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <ul className="space-y-2">
              {missedCrucialQuestions.map((q) => (
                <li key={q.id} className="text-warning flex items-start gap-2">
                  <span className="text-warning/70 mt-0.5">!</span>
                  <div>
                    <div>{q.text}</div>
                    {q.reveals && (
                      <div className="text-xs text-warning/80 mt-1">
                        Would have revealed: {q.reveals.constraint} = {q.reveals.value}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Irrelevant Questions Selected */}
      {irrelevantQuestionsSelected.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-3">
            Irrelevant Questions Selected
          </h3>
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <ul className="space-y-1">
              {irrelevantQuestionsSelected.map((q) => (
                <li key={q.id} className="text-error flex items-center gap-2">
                  <span className="text-error/70">✗</span>
                  <span>{q.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button
          onClick={() => {
            reset();
            setPhase('questions');
          }}
          className="px-4 py-2 text-primary hover:text-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg"
        >
          Try Again
        </button>
        <Link
          to="/architecture"
          className="px-6 py-2 bg-bg-secondary text-text-primary rounded-lg hover:bg-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Back to Questions
        </Link>
      </div>
    </div>
  );
}
