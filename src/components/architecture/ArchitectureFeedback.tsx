import { useArchitectureStore } from '@/stores/architectureStore';
import { Link } from 'react-router-dom';

export function ArchitectureFeedback() {
  const { validationResult, reset } = useArchitectureStore();

  if (!validationResult) {
    return <div className="p-6 text-slate-600">No results available.</div>;
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
    <div className="p-6 overflow-y-auto">
      {/* Overall Result */}
      <div
        className={`mb-6 p-4 rounded-lg border-2 ${
          passed
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{passed ? '✓' : '✗'}</span>
          <div>
            <div className={`text-xl font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>
              {passed ? 'Great Job!' : 'Not Quite Right'}
            </div>
            <div className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
              Total Score: {totalScore} points
            </div>
          </div>
        </div>
      </div>

      {/* Question Scores */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-800 mb-3">Question Scoring Breakdown</h3>
        <div className="space-y-2">
          {questionScores.map((qs) => (
            <div
              key={qs.questionId}
              className={`p-3 rounded-lg flex justify-between items-center ${
                qs.points > 0
                  ? 'bg-green-50 border border-green-200'
                  : qs.points < 0
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <div>
                <div className="text-sm text-slate-700">{qs.questionText}</div>
                <div
                  className={`text-xs mt-1 ${
                    qs.category === 'crucial'
                      ? 'text-green-600'
                      : qs.category === 'helpful'
                        ? 'text-blue-600'
                        : 'text-red-600'
                  }`}
                >
                  {qs.category.charAt(0).toUpperCase() + qs.category.slice(1)} question
                </div>
              </div>
              <div
                className={`font-bold ${
                  qs.points > 0 ? 'text-green-600' : qs.points < 0 ? 'text-red-600' : 'text-slate-600'
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
          <h3 className="font-semibold text-slate-800 mb-3">Constraints You Discovered</h3>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <ul className="space-y-1">
              {revealedConstraints.map((rc, idx) => (
                <li key={idx} className="text-blue-800 flex items-center gap-2">
                  <span className="text-blue-500">•</span>
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
        <h3 className="font-semibold text-slate-800 mb-3">Architecture Choice</h3>
        <div
          className={`p-4 rounded-lg border ${
            architectureCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">{architectureCorrect ? '✓' : '!'}</span>
            <p className={architectureCorrect ? 'text-green-800' : 'text-amber-800'}>
              {architectureFeedback}
            </p>
          </div>
        </div>
      </div>

      {/* Missed Crucial Questions */}
      {missedCrucialQuestions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">
            Crucial Questions You Missed
          </h3>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <ul className="space-y-2">
              {missedCrucialQuestions.map((q) => (
                <li key={q.id} className="text-amber-800 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">!</span>
                  <div>
                    <div>{q.text}</div>
                    {q.reveals && (
                      <div className="text-xs text-amber-600 mt-1">
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
          <h3 className="font-semibold text-slate-800 mb-3">
            Irrelevant Questions Selected
          </h3>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <ul className="space-y-1">
              {irrelevantQuestionsSelected.map((q) => (
                <li key={q.id} className="text-red-700 flex items-center gap-2">
                  <span className="text-red-500">✗</span>
                  <span>{q.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          onClick={reset}
          className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          Try Again
        </button>
        <Link
          to="/architecture"
          className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Back to Questions
        </Link>
      </div>
    </div>
  );
}
