import { SkillStats, SkillType } from '@/types';

interface SkillBreakdownProps {
  stats: SkillStats;
}

const SKILL_LABELS: Record<SkillType, string> = {
  sql: 'SQL',
  pyspark: 'PySpark',
  debug: 'Debug',
  architecture: 'Architecture',
  modeling: 'Modeling',
};

interface BarProps {
  label: string;
  solved: number;
  total: number;
  color: string;
}

function ProgressBar({ label, solved, total, color }: BarProps) {
  const pct = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${color}`}>{label}</span>
        <span className="text-xs text-text-muted">
          {solved}/{total}
        </span>
      </div>
      <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }}
        />
      </div>
    </div>
  );
}

export function SkillBreakdown({ stats }: SkillBreakdownProps) {
  return (
    <div className="bg-surface rounded-xl p-6 ring-1 ring-white/5">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {SKILL_LABELS[stats.skill]} Breakdown
      </h3>
      <div className="space-y-4">
        <ProgressBar
          label="Easy"
          solved={stats.easySolved}
          total={stats.easyTotal}
          color="text-success"
        />
        <ProgressBar
          label="Medium"
          solved={stats.mediumSolved}
          total={stats.mediumTotal}
          color="text-warning"
        />
        <ProgressBar
          label="Hard"
          solved={stats.hardSolved}
          total={stats.hardTotal}
          color="text-error"
        />
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{Math.round(stats.mastery)}%</div>
          <div className="text-xs text-text-muted">Mastery</div>
        </div>
      </div>
    </div>
  );
}
