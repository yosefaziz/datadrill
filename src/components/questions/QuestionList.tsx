import { useQuestionStore } from '@/stores/questionStore';
import { QuestionCard } from './QuestionCard';
import { Filters } from './Filters';
import { SkillType } from '@/types';

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-lg p-4 border border-border animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-16 bg-border rounded" />
        <div className="h-4 w-12 bg-border rounded" />
      </div>
      <div className="h-6 bg-border rounded w-3/4 mb-2" />
      <div className="space-y-2">
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-2/3" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-14 bg-border rounded" />
        <div className="h-5 w-14 bg-border rounded" />
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
