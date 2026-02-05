interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
  thresholds: { green: number; yellow: number };
}

function ScoreBar({ label, score, maxScore, thresholds }: ScoreBarProps) {
  // Equal zones: 33% green, 33% yellow, 33% red
  const percentage = Math.min((score / maxScore) * 100, 100);

  const status =
    score <= thresholds.green ? 'green' : score <= thresholds.yellow ? 'yellow' : 'red';

  const statusColors = {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-error',
  };

  const statusLabels = {
    green: 'Good',
    yellow: 'Warning',
    red: 'High',
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-text-secondary">{score}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              status === 'green'
                ? 'bg-success/20 text-success'
                : status === 'yellow'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-error/20 text-error'
            }`}
          >
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Bar background with equal zones */}
      <div className="h-3 rounded-full bg-bg-secondary relative overflow-hidden">
        {/* Equal zone indicators: 33% each */}
        <div className="absolute inset-y-0 left-0 bg-success/40 w-1/3" />
        <div className="absolute inset-y-0 left-1/3 bg-warning/40 w-1/3" />
        <div className="absolute inset-y-0 left-2/3 bg-error/40 w-1/3" />

        {/* Actual score bar */}
        <div
          className={`h-full rounded-full transition-all duration-300 ${statusColors[status]}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Threshold markers */}
        <div className="absolute inset-y-0 left-1/3 w-0.5 bg-border" />
        <div className="absolute inset-y-0 left-2/3 w-0.5 bg-border" />
      </div>
    </div>
  );
}

interface ScoreBarsProps {
  storageScore: number;
  queryCostScore: number;
  storageThresholds: { green: number; yellow: number };
  queryCostThresholds: { green: number; yellow: number };
}

export function ScoreBars({
  storageScore,
  queryCostScore,
  storageThresholds,
  queryCostThresholds,
}: ScoreBarsProps) {
  // Max score is 3x the yellow threshold (so red zone is the last third)
  const maxStorage = storageThresholds.yellow * 1.5;
  const maxQueryCost = queryCostThresholds.yellow * 1.5;

  return (
    <div className="flex gap-6">
      <ScoreBar
        label="Storage"
        score={storageScore}
        maxScore={maxStorage}
        thresholds={storageThresholds}
      />
      <ScoreBar
        label="Query Cost"
        score={queryCostScore}
        maxScore={maxQueryCost}
        thresholds={queryCostThresholds}
      />
    </div>
  );
}
