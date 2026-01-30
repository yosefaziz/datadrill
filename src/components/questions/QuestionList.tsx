import { useQuestionStore } from '@/stores/questionStore';
import { QuestionCard } from './QuestionCard';
import { Filters } from './Filters';

export function QuestionList() {
  const { getFilteredQuestions, isLoading, error } = useQuestionStore();
  const questions = getFilteredQuestions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Filters />
      {questions.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          No questions match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
