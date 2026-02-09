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
        const isLocked = level.level > currentLevel
          && level.unlockCondition === 'complete_previous';

        return (
          <div
            key={level.level}
            className="animate-fade-in"
            style={{ animationDelay: `${levelIndex * 80}ms` }}
          >
            {/* Level header — just a label */}
            <div className={`flex items-center gap-2 mb-3 ${isLocked ? 'opacity-40' : ''}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-text-muted'
              }`}>
                Level {level.level}
              </span>
              <span className="text-text-muted">&middot;</span>
              <span className={`text-sm font-medium ${
                isLocked ? 'text-text-muted' : 'text-text-primary'
              }`}>
                {level.title}
              </span>
              {isLocked && (
                <svg className="w-3.5 h-3.5 text-text-muted ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Questions */}
            <div className={`space-y-1 ${isLocked ? 'opacity-40' : ''}`}>
              {level.questionIds.map((questionId, idx) => {
                const isQuestionCompleted = completedIds.has(questionId);
                const isNextQuestion = isCurrent && !isQuestionCompleted &&
                  level.questionIds.slice(0, idx).every((id) => completedIds.has(id));

                return (
                  <PathQuestionNode
                    key={questionId}
                    questionId={questionId}
                    skill={track.skill}
                    title={getQuestionTitle(questionId)}
                    isCompleted={isQuestionCompleted}
                    isCurrent={isNextQuestion}
                    isLocked={isLocked}
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
