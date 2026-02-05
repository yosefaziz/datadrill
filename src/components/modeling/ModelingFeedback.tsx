import { AlertTriangle, Lightbulb, Check } from 'lucide-react';
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
            ? 'bg-success/10 border-success'
            : 'bg-error/10 border-error'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              result.passed ? 'bg-success' : 'bg-error'
            }`}
          >
            {result.passed ? (
              <svg
                className="w-6 h-6 text-text-primary"
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
                className="w-6 h-6 text-text-primary"
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
                result.passed ? 'text-success' : 'text-error'
              }`}
            >
              {result.passed ? 'Well Balanced Model!' : 'Needs Optimization'}
            </div>
            <div className="text-sm text-text-secondary">{result.overallFeedback}</div>
          </div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Final Scores</h3>
        <ScoreBars
          storageScore={result.storageScore}
          queryCostScore={result.queryCostScore}
          storageThresholds={thresholds.storage}
          queryCostThresholds={thresholds.queryCost}
        />
      </div>

      {/* Table-by-Table Feedback */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Table Analysis</h3>
        <div className="space-y-3">
          {result.tableResults.map((table, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                table.issues.length === 0
                  ? 'bg-success/10 border-success/30'
                  : 'bg-warning/10 border-warning/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    table.tableType === 'fact'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-info/20 text-info'
                  }`}
                >
                  {table.tableType === 'fact' ? 'FACT' : 'DIM'}
                </span>
                <span className="font-medium text-text-primary">{table.tableName}</span>
                <span className="text-xs text-text-muted">
                  ({table.fieldCount} fields)
                </span>
              </div>

              {table.feedback && (
                <div className="text-sm text-text-secondary mb-2">{table.feedback}</div>
              )}

              {table.issues.length > 0 && (
                <ul className="text-sm space-y-1">
                  {table.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-warning">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}

              {table.issues.length === 0 && (
                <div className="text-sm text-success flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Well structured</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Educational Tips */}
      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-warning" />
          Remember
        </h3>
        <ul className="text-sm text-text-secondary space-y-1">
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
