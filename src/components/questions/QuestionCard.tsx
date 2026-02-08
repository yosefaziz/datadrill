import { Link } from 'react-router-dom';
import { QuestionMeta, SkillType } from '@/types';
import { useQuestionStore, QuestionStatus } from '@/stores/questionStore';

interface QuestionCardProps {
  question: QuestionMeta;
  skill: SkillType;
  className?: string;
}

const difficultyColors = {
  Easy: 'text-success',
  Medium: 'text-warning',
  Hard: 'text-error',
};

const statusConfig: Record<QuestionStatus, { label: string; className: string }> = {
  passed: { label: 'Passed', className: 'text-success' },
  failed: { label: 'Failed', className: 'text-error' },
  not_started: { label: '—', className: 'text-text-muted' },
};

export function QuestionCard({ question, skill, className = '' }: QuestionCardProps) {
  const status = useQuestionStore((s) => s.getQuestionStatus)(question.id);
  const { label, className: statusClass } = statusConfig[status];

  return (
    <Link
      to={`/${skill}/question/${question.id}`}
      className={`grid grid-cols-[1fr_6rem_6rem] items-center gap-8 px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150 ${className}`}
    >
      {/* Title */}
      <span className="text-sm font-medium text-text-primary truncate">
        {question.title}
      </span>

      {/* Difficulty */}
      <span className={`text-xs font-medium ${difficultyColors[question.difficulty]}`}>
        {question.difficulty}
      </span>

      {/* Status */}
      <span className={`text-xs font-medium ${statusClass}`}>
        {label}
      </span>
    </Link>
  );
}
