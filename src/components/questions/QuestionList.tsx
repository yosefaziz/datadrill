import { useEffect } from 'react';
import { useQuestionStore } from '@/stores/questionStore';
import { useAuthStore } from '@/stores/authStore';
import { QuestionCard } from './QuestionCard';
import { Filters } from './Filters';
import { SkillType } from '@/types';

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-4 px-4 py-3 animate-pulse">
      <div className="h-4 bg-white/10 rounded" />
      <div className="h-4 w-12 bg-white/10 rounded" />
      <div className="h-4 w-12 bg-white/5 rounded" />
    </div>
  );
}

interface QuestionListProps {
  skill: SkillType;
}

export function QuestionList({ skill }: QuestionListProps) {
  const { getFilteredQuestions, fetchQuestionStatuses, isLoading, error } = useQuestionStore();
  const user = useAuthStore((s) => s.user);
  const questions = getFilteredQuestions();

  useEffect(() => {
    if (user) {
      fetchQuestionStatuses(skill, user.id);
    }
  }, [skill, user, fetchQuestionStatuses]);

  if (isLoading) {
    return (
      <div>
        <Filters />
        <div className="bg-surface rounded-xl ring-1 ring-white/5 divide-y divide-white/5 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Filters />
      {questions.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          No questions match the current filters.
        </div>
      ) : (
        <div className="bg-surface rounded-xl ring-1 ring-white/5 divide-y divide-white/5 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-4 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Title</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Difficulty</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status</span>
          </div>

          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              skill={skill}
              className={`animate-fade-in stagger-${Math.min(index + 1, 6)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
