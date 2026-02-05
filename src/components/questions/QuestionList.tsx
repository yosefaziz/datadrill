import { useQuestionStore } from '@/stores/questionStore';
import { QuestionCard } from './QuestionCard';
import { Filters } from './Filters';
import { SkillType } from '@/types';

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-lg p-5 shadow-md ring-1 ring-white/5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-5 w-14 bg-white/10 rounded-full" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-16 bg-white/5 rounded" />
        <div className="h-5 w-16 bg-white/5 rounded" />
      </div>
    </div>
  );
}

interface QuestionListProps {
  skill: SkillType;
}

export function QuestionList({ skill }: QuestionListProps) {
  const { getFilteredQuestions, isLoading, error } = useQuestionStore();
  const questions = getFilteredQuestions();

  if (isLoading) {
    return (
      <div>
        <Filters />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              skill={skill}
              className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
