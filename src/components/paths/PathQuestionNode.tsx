import { Link } from 'react-router-dom';
import { SkillType } from '@/types';

interface PathQuestionNodeProps {
  questionId: string;
  skill: SkillType;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

export function PathQuestionNode({
  questionId, skill, title,
  isCompleted, isCurrent, isLocked,
}: PathQuestionNodeProps) {
  const row = (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
      isLocked
        ? ''
        : isCompleted
        ? 'hover:bg-success/5'
        : isCurrent
        ? 'bg-primary/5 hover:bg-primary/8'
        : 'hover:bg-white/5'
    }`}>
      {/* Status dot */}
      <div className={`shrink-0 w-2 h-2 rounded-full ${
        isCompleted
          ? 'bg-success'
          : isCurrent
          ? 'bg-primary animate-pulse'
          : 'bg-border-color'
      }`} />

      {/* Title */}
      <span className={`text-sm ${
        isCompleted
          ? 'text-text-secondary line-through decoration-border-color'
          : isCurrent
          ? 'text-text-primary font-medium'
          : isLocked
          ? 'text-text-muted'
          : 'text-text-secondary'
      }`}>
        {title}
      </span>
    </div>
  );

  if (isLocked) {
    return row;
  }

  return (
    <Link to={`/${skill}/question/${questionId}`} className="block">
      {row}
    </Link>
  );
}
