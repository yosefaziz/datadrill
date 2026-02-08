import { useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useQuestionStore, SortColumn } from '@/stores/questionStore';
import { useAuthStore } from '@/stores/authStore';
import { QuestionCard } from './QuestionCard';
import { Filters } from './Filters';
import { SkillType } from '@/types';

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_6rem_6rem] items-center gap-8 px-4 py-3 animate-pulse">
      <div className="h-4 bg-white/10 rounded" />
      <div className="h-4 w-12 bg-white/10 rounded" />
      <div className="h-4 w-12 bg-white/5 rounded" />
    </div>
  );
}

interface QuestionListProps {
  skill: SkillType;
}

function SortHeader({ column, label }: { column: SortColumn; label: string }) {
  const sort = useQuestionStore((s) => s.sort);
  const toggleSort = useQuestionStore((s) => s.toggleSort);
  const isActive = sort.column === column;

  return (
    <button
      onClick={() => toggleSort(column)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none"
    >
      {label}
      <span className="inline-flex flex-col -space-y-1">
        <ChevronUp className={`w-3 h-3 ${isActive && sort.direction === 'asc' ? 'text-primary' : 'opacity-30'}`} />
        <ChevronDown className={`w-3 h-3 ${isActive && sort.direction === 'desc' ? 'text-primary' : 'opacity-30'}`} />
      </span>
    </button>
  );
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
          <div className="grid grid-cols-[1fr_6rem_6rem] items-center gap-8 px-4 py-2">
            <SortHeader column="title" label="Title" />
            <SortHeader column="difficulty" label="Difficulty" />
            <SortHeader column="status" label="Status" />
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
