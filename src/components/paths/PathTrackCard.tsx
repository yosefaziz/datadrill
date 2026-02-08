import { Link } from 'react-router-dom';
import { TrendingUp, SearchX, LucideIcon } from 'lucide-react';
import { SkillTrackMeta } from '@/types';
import { useTrackStore } from '@/stores/trackStore';

// Map icon names from YAML to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  'trending-up': TrendingUp,
  'search-x': SearchX,
};

// Category accent colors (left border)
const CATEGORY_COLORS: Record<string, string> = {
  'Window Functions': 'border-l-primary',
  'Joins & Filtering': 'border-l-accent',
  'Aggregation & Logic': 'border-l-success',
  'Complex Patterns': 'border-l-warning',
  'Advanced': 'border-l-error',
};

interface PathTrackCardProps {
  track: SkillTrackMeta;
}

export function PathTrackCard({ track }: PathTrackCardProps) {
  const { trackProgress } = useTrackStore();
  const progress = trackProgress[track.id];
  const percentComplete = progress?.percentComplete ?? 0;

  const Icon = ICON_MAP[track.icon];
  const accentColor = CATEGORY_COLORS[track.category] || 'border-l-primary';

  return (
    <Link
      to={`/${track.skill}/path/${track.id}`}
      className={`block h-full bg-surface rounded-xl ring-1 ring-white/5 hover:ring-primary/30 transition-all duration-200 border-l-[3px] ${accentColor} hover:-translate-y-0.5`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Icon */}
        <div className="mb-3">
          {Icon ? (
            <Icon className="w-6 h-6 text-primary" />
          ) : (
            <div className="w-6 h-6 rounded bg-primary/20" />
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-text-primary mb-1 leading-tight">
          {track.name}
        </h4>

        {/* Tagline */}
        <p className="text-xs text-text-secondary mb-3 leading-snug flex-1">
          {track.tagline}
        </p>

        {/* Footer: stats + progress */}
        <div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted mb-2">
            <span>{track.totalQuestions} qs</span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
            <span>{track.totalLevels} levels</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
