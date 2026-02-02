import { ModelingValidationResult, ModelingScoreThresholds } from '@/types';
import { ScoreBars } from './ScoreBars';

interface ModelingFeedbackProps {
  result: ModelingValidationResult;
  thresholds: ModelingScoreThresholds;
}

export function ModelingFeedback({ result, thresholds }: ModelingFeedbackProps) {
  return (
    <div className="space-y-6">
      {/* Overall Result */}
      <div
        className={`p-4 rounded-lg border-2 ${
          result.passed
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              result.passed ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {result.passed ? (
              <svg
                className="w-6 h-6 text-white"
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
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div>
            <div
              className={`font-semibold ${
                result.passed ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.passed ? 'Well Balanced Model!' : 'Needs Optimization'}
            </div>
            <div className="text-sm text-slate-600">{result.overallFeedback}</div>
          </div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Final Scores</h3>
        <ScoreBars
          storageScore={result.storageScore}
          queryCostScore={result.queryCostScore}
          storageThresholds={thresholds.storage}
          queryCostThresholds={thresholds.queryCost}
        />
      </div>

      {/* Table-by-Table Feedback */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Table Analysis</h3>
        <div className="space-y-3">
          {result.tableResults.map((table, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                table.issues.length === 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    table.tableType === 'fact'
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-sky-200 text-sky-800'
                  }`}
                >
                  {table.tableType === 'fact' ? 'FACT' : 'DIM'}
                </span>
                <span className="font-medium text-slate-800">{table.tableName}</span>
                <span className="text-xs text-slate-500">
                  ({table.fieldCount} fields)
                </span>
              </div>

              {table.feedback && (
                <div className="text-sm text-slate-600 mb-2">{table.feedback}</div>
              )}

              {table.issues.length > 0 && (
                <ul className="text-sm space-y-1">
                  {table.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-700">
                      <span className="mt-1">⚠️</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}

              {table.issues.length === 0 && (
                <div className="text-sm text-green-700 flex items-center gap-1">
                  <span>✓</span>
                  <span>Well structured</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Educational Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">💡 Remember</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            • <strong>Fact tables</strong> have billions of rows — every field adds significant
            storage
          </li>
          <li>
            • <strong>Dimension tables</strong> are small — it's OK to denormalize here
          </li>
          <li>
            • <strong>More tables = more JOINs</strong> — impacts query performance
          </li>
          <li>
            • <strong>Star Schema</strong> balances storage and query cost effectively
          </li>
        </ul>
      </div>
    </div>
  );
}
