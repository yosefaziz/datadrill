import { UserStats } from '@/types';

interface StatsCardsProps {
  stats: UserStats;
}

interface CardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: CardProps) {
  return (
    <div className="bg-surface rounded-xl p-4 ring-1 ring-white/5 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
      {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        label="Questions Solved"
        value={stats.totalSolved}
        sub={`of ${stats.totalAttempted} attempted`}
      />
      <StatCard
        label="Pass Rate"
        value={`${Math.round(stats.passRate)}%`}
      />
      <StatCard
        label="Skills Practiced"
        value={stats.skills.filter((s) => s.easySolved + s.mediumSolved + s.hardSolved > 0).length}
        sub="of 5"
      />
    </div>
  );
}
