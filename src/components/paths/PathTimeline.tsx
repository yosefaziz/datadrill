import { SkillTrack, TrackProgress } from '@/types';
import { PathQuestionNode } from './PathQuestionNode';

interface PathTimelineProps {
  track: SkillTrack;
  progress: TrackProgress | null;
  getQuestionTitle: (id: string) => string;
}

export function PathTimeline({ track, progress, getQuestionTitle }: PathTimelineProps) {
  const completedIds = new Set(progress?.completedQuestionIds ?? []);
  const currentLevel = progress?.currentLevel ?? 1;

  return (
    <div className="space-y-8">
      {track.levels.map((level, levelIndex) => {
        const isCompleted = level.level < currentLevel;
        const isCurrent = level.level === currentLevel;

        return (
          <div
            key={level.level}
            className="animate-fade-in"
            style={{ animationDelay: `${levelIndex * 80}ms` }}
          >
            {/* Level header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-text-muted'
              }`}>
                Level {level.level}
              </span>
              <span className="text-text-muted">&middot;</span>
              <span className="text-sm font-medium text-text-primary">
                {level.title}
              </span>
            </div>

            {/* Questions */}
            <div className="space-y-1">
              {level.questionIds.map((questionId, idx) => {
                const isQuestionCompleted = completedIds.has(questionId);
                const isNextQuestion = isCurrent && !isQuestionCompleted &&
                  level.questionIds.slice(0, idx).every((id) => completedIds.has(id));

                return (
                  <PathQuestionNode
                    key={questionId}
                    questionId={questionId}
                    skill={track.skill}
                    trackId={track.id}
                    title={getQuestionTitle(questionId)}
                    isCompleted={isQuestionCompleted}
                    isCurrent={isNextQuestion}
                    isLocked={false}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
