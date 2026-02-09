import { InterviewRound, RoundResult } from '@/types';

interface InterviewRoundResultProps {
  roundIndex: number;
  round: InterviewRound;
  result: RoundResult | undefined;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case 'sql':
      return 'bg-blue-500/20 text-blue-400';
    case 'python':
      return 'bg-green-500/20 text-green-400';
    case 'debug':
      return 'bg-orange-500/20 text-orange-400';
    case 'architecture':
      return 'bg-purple-500/20 text-purple-400';
    case 'modeling':
      return 'bg-pink-500/20 text-pink-400';
    default:
      return 'bg-bg-secondary text-text-secondary';
  }
}

export function InterviewRoundResult({ roundIndex, round, result }: InterviewRoundResultProps) {
  let circleClass = 'bg-bg-secondary text-text-muted';
  let scoreColor = 'text-text-muted';
  let scoreText = '--';

  if (result) {
    if (result.passed) {
      circleClass = 'bg-success/20 text-success';
      scoreColor = 'text-success';
    } else {
      circleClass = 'bg-error/20 text-error';
      scoreColor = 'text-error';
    }
    scoreText = `${Math.round(result.score * 100)}%`;
  }

  return (
    <div className="bg-surface rounded-xl ring-1 ring-white/5 p-4 flex items-center gap-4">
      {/* Left: round number circle */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${circleClass}`}
      >
        {roundIndex + 1}
      </div>

      {/* Center: title, type badge, time */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary font-medium truncate">{round.title}</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${getTypeBadgeClass(round.type)}`}
          >
            {round.type}
          </span>
        </div>
        <div className="text-sm text-text-secondary mt-0.5">
          {result ? formatTime(result.timeSpentSeconds) : 'Skipped'} / {round.timeMinutes}m limit
        </div>
      </div>

      {/* Right: score */}
      <div className={`text-lg font-bold shrink-0 ${scoreColor}`}>
        {scoreText}
      </div>
    </div>
  );
}
