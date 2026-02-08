import { SkillTrack, TrackProgress } from '@/types';
import { PathQuestionNode } from './PathQuestionNode';

interface PathTimelineProps {
  track: SkillTrack;
  progress: TrackProgress | null;
}

export function PathTimeline({ track, progress }: PathTimelineProps) {
  const completedIds = new Set(progress?.completedQuestionIds ?? []);
  const currentLevel = progress?.currentLevel ?? 1;

  return (
    <div className="space-y-2">
      {track.levels.map((level) => {
        const isCompleted = level.level < currentLevel;
        const isCurrent = level.level === currentLevel;
        const isLocked = level.level > currentLevel && level.unlockCondition === 'complete_previous';

        return (
          <div key={level.level} className="relative">
            {/* Connecting line between levels */}
            {level.level < track.levels.length && (
              <div className="absolute left-5 top-full w-0.5 h-2 bg-border-color z-0" />
            )}

            <div className={`bg-surface rounded-xl ring-1 ring-white/5 p-5 ${
              isCurrent ? 'ring-primary/30' : ''
            }`}>
              {/* Level header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted
                    ? 'bg-success/20 text-success'
                    : isCurrent
                    ? 'bg-primary/20 text-primary'
                    : 'bg-bg-secondary text-text-muted'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : isLocked ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    level.level
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${
                      isLocked ? 'text-text-muted' : 'text-text-primary'
                    }`}>
                      Level {level.level}: {level.title}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isLocked ? 'text-text-muted' : 'text-text-secondary'}`}>
                    {level.description}
                  </p>
                </div>
              </div>

              {/* Question nodes */}
              <div className="flex items-center gap-2 ml-11 flex-wrap">
                {level.questionIds.map((questionId, idx) => {
                  const isQuestionCompleted = completedIds.has(questionId);
                  const isNextQuestion = isCurrent && !isQuestionCompleted &&
                    level.questionIds.slice(0, idx).every((id) => completedIds.has(id));

                  return (
                    <div key={questionId} className="flex items-center gap-2">
                      {idx > 0 && (
                        <div className={`w-4 h-0.5 ${
                          isQuestionCompleted ? 'bg-success/50' : 'bg-border-color'
                        }`} />
                      )}
                      <PathQuestionNode
                        questionId={questionId}
                        skill={track.skill}
                        isCompleted={isQuestionCompleted}
                        isCurrent={isNextQuestion}
                        isLocked={isLocked}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
