import { useEffect } from 'react';
import { useQuestionStore } from '@/stores/questionStore';
import { QuestionList } from '@/components/questions/QuestionList';

export function HomePage() {
  const { fetchQuestions } = useQuestionStore();

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">SQL Practice Questions</h1>
      <p className="text-slate-600 mb-8">
        Practice SQL interview questions with instant feedback
      </p>
      <QuestionList />
    </div>
  );
}
