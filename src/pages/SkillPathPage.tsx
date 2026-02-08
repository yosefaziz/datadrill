import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrackStore } from '@/stores/trackStore';
import { PathTimeline } from '@/components/paths/PathTimeline';
import { SkillType } from '@/types';

function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling';
}

const SKILL_NAMES: Record<SkillType, string> = {
  sql: 'SQL',
  python: 'Python',
  debug: 'Debug',
  architecture: 'Architecture',
  modeling: 'Modeling',
};

export function SkillPathPage() {
  const { skill, trackId } = useParams<{ skill: string; trackId: string }>();
  const { tracksById, trackProgress, fetchTrack, isLoading } = useTrackStore();

  useEffect(() => {
    if (trackId) {
      fetchTrack(trackId);
    }
  }, [trackId, fetchTrack]);

  if (!isValidSkill(skill) || !trackId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-4">Invalid path</div>
          <Link to="/" className="text-primary hover:text-primary-hover transition-colors duration-200">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const track = tracksById[trackId];
  const progress = trackProgress[trackId] ?? null;

  if (isLoading && !track) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-8 w-72 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
          <div className="h-3 w-64 bg-white/5 rounded" />
          <div className="h-4 w-48 bg-white/10 rounded mt-6" />
          <div className="space-y-3 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-4">Track not found</div>
          <Link to={`/${skill}`} className="text-primary hover:text-primary-hover transition-colors duration-200">
            Back to {SKILL_NAMES[skill]}
          </Link>
        </div>
      </div>
    );
  }

  const percentComplete = progress?.percentComplete ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back link */}
      <div className="mb-6 animate-fade-in">
        <Link to={`/${skill}`} className="text-primary hover:text-primary-hover text-sm transition-colors duration-200">
          &larr; {SKILL_NAMES[skill]} Paths
        </Link>
      </div>

      {/* Track header */}
      <div className="mb-8 animate-fade-in stagger-2">
        <h1 className="text-2xl font-bold text-text-primary mb-1">{track.name}</h1>
        <p className="text-sm text-text-secondary mb-1">
          When they say: &ldquo;{track.interviewerSays}&rdquo;
        </p>
        <p className="text-xs text-text-muted">
          You&apos;ll master: {track.youNeed}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 animate-fade-in stagger-3">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>
            Level {progress?.currentLevel ?? 1} of {track.levels.length}
          </span>
          <span>{percentComplete}%</span>
        </div>
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="animate-fade-in stagger-4">
        <PathTimeline track={track} progress={progress} />
      </div>
    </div>
  );
}
