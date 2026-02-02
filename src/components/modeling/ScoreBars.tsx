interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
  thresholds: { green: number; yellow: number };
  icon: string;
}

function ScoreBar({ label, score, maxScore, thresholds, icon }: ScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const greenPercentage = (thresholds.green / maxScore) * 100;
  const yellowPercentage = (thresholds.yellow / maxScore) * 100;

  const status =
    score <= thresholds.green ? 'green' : score <= thresholds.yellow ? 'yellow' : 'red';

  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const statusLabels = {
    green: 'Good',
    yellow: 'Warning',
    red: 'High',
  };

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-600">{score}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              status === 'green'
                ? 'bg-green-100 text-green-700'
                : status === 'yellow'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Bar background with zones */}
      <div className="h-4 rounded-full bg-slate-100 relative overflow-hidden">
        {/* Zone indicators */}
        <div
          className="absolute inset-y-0 left-0 bg-green-200 opacity-50"
          style={{ width: `${greenPercentage}%` }}
        />
        <div
          className="absolute inset-y-0 bg-yellow-200 opacity-50"
          style={{ left: `${greenPercentage}%`, width: `${yellowPercentage - greenPercentage}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-red-200 opacity-50"
          style={{ left: `${yellowPercentage}%` }}
        />

        {/* Actual score bar */}
        <div
          className={`h-full rounded-full transition-all duration-300 ${statusColors[status]}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Threshold markers */}
        <div
          className="absolute inset-y-0 w-0.5 bg-green-600 opacity-60"
          style={{ left: `${greenPercentage}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-yellow-600 opacity-60"
          style={{ left: `${yellowPercentage}%` }}
        />
      </div>

    </div>
  );
}

interface ScoreBarsProps {
  storageScore: number;
  queryCostScore: number;
  maxStorage: number;
  maxQueryCost: number;
  storageThresholds: { green: number; yellow: number };
  queryCostThresholds: { green: number; yellow: number };
}

export function ScoreBars({
  storageScore,
  queryCostScore,
  maxStorage,
  maxQueryCost,
  storageThresholds,
  queryCostThresholds,
}: ScoreBarsProps) {
  return (
    <div>
      <ScoreBar
        label="Storage Cost"
        score={storageScore}
        maxScore={maxStorage}
        thresholds={storageThresholds}
        icon="💾"
      />
      <ScoreBar
        label="Query Cost"
        score={queryCostScore}
        maxScore={maxQueryCost}
        thresholds={queryCostThresholds}
        icon="⚡"
      />
    </div>
  );
}
