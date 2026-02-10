import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrackStore } from '@/stores/trackStore';
import { useQuestionStore } from '@/stores/questionStore';
import { PathTimeline } from '@/components/paths/PathTimeline';
import { SkillType } from '@/types';

function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling' || skill === 'tools';
}

const SKILL_NAMES: Record<SkillType, string> = {
  sql: 'SQL',
  python: 'Python',
  debug: 'Debug',
  architecture: 'Architecture',
  modeling: 'Modeling',
  tools: 'Tools & Frameworks',
};

export function SkillPathPage() {
  const { skill, trackId } = useParams<{ skill: string; trackId: string }>();
  const { tracksById, trackProgress, fetchTrack, isLoading } = useTrackStore();
  const { questionsBySkill, fetchQuestionsForSkill } = useQuestionStore();

  useEffect(() => {
    if (trackId) {
      fetchTrack(trackId);
    }
  }, [trackId, fetchTrack]);

  useEffect(() => {
    if (isValidSkill(skill)) {
      fetchQuestionsForSkill(skill);
    }
  }, [skill, fetchQuestionsForSkill]);

  const questionTitles = useMemo(() => {
    if (!isValidSkill(skill)) return {};
    const map: Record<string, string> = {};
    for (const q of questionsBySkill[skill] ?? []) {
      map[q.id] = q.title;
    }
    return map;
  }, [skill, questionsBySkill]);

  // For question IDs without a real title, derive a readable name
  const getQuestionTitle = (questionId: string): string => {
    if (questionTitles[questionId]) return questionTitles[questionId];
    const ABBREV: Record<string, string> = {
      mom: 'MoM', yoy: 'YoY', qoq: 'QoQ', dau: 'DAU', wau: 'WAU', mau: 'MAU',
      cte: 'CTE', json: 'JSON', sql: 'SQL', udf: 'UDF', bom: 'BOM', dml: 'DML',
      avg: 'AVG', cumsum: 'Cumulative Sum', cumavg: 'Cumulative Avg',
      cumdistinct: 'Cumulative Distinct', fillna: 'Fill NA', nday: 'N-Day',
      selfjoin: 'Self-Join', asof: 'As-Of',
    };
    return questionId
      .replace(/^(yoy|py|dbg|sql|setops|attrib|active)-/, '')
      .split('-')
      .map(w => ABBREV[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-7 w-64 bg-white/10 rounded" />
            <div className="h-4 w-80 bg-white/5 rounded" />
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full" />
          <div className="space-y-4 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-40 bg-white/10 rounded" />
                <div className="h-12 bg-white/5 rounded-lg" />
              </div>
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
  const totalQuestions = track.levels.reduce((sum, l) => sum + l.questionIds.length, 0);
  const completedCount = progress?.completedQuestionIds?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back link */}
      <div className="mb-8 animate-fade-in">
        <Link to={`/${skill}?tab=paths`} className="text-text-muted hover:text-text-secondary text-sm transition-colors duration-200">
          &larr; {SKILL_NAMES[skill]} Playbooks
        </Link>
      </div>

      {/* Header — compact and clear */}
      <div className="mb-8 animate-fade-in stagger-2">
        <h1 className="text-xl font-bold text-text-primary mb-1">{track.name}</h1>
        <p className="text-sm text-text-secondary mb-5">{track.tagline}</p>

        {/* Single progress bar with inline stats */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <span className="text-xs text-text-muted tabular-nums shrink-0">
            {completedCount}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Track complete */}
      {percentComplete === 100 && (
        <div className="mb-8 animate-fade-in rounded-lg bg-success/10 px-4 py-3 text-center text-sm text-success font-medium">
          Track complete
        </div>
      )}

      {/* Timeline */}
      <div className="animate-fade-in stagger-3">
        <PathTimeline track={track} progress={progress} getQuestionTitle={getQuestionTitle} />
      </div>
    </div>
  );
}
