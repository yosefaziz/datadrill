import { Link } from 'react-router-dom';
import { SkillType } from '@/types';

interface PathQuestionNodeProps {
  questionId: string;
  skill: SkillType;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

export function PathQuestionNode({ questionId, skill, isCompleted, isCurrent, isLocked }: PathQuestionNodeProps) {
  const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200';

  if (isLocked) {
    return (
      <div className={`${baseClasses} bg-bg-secondary text-text-muted`} title={questionId}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <Link
        to={`/${skill}/question/${questionId}`}
        className={`${baseClasses} bg-success/20 text-success hover:bg-success/30`}
        title={questionId}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </Link>
    );
  }

  if (isCurrent) {
    return (
      <Link
        to={`/${skill}/question/${questionId}`}
        className={`${baseClasses} bg-primary/20 text-primary ring-2 ring-primary/40 hover:bg-primary/30 animate-pulse`}
        title={questionId}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </Link>
    );
  }

  // Available but not attempted
  return (
    <Link
      to={`/${skill}/question/${questionId}`}
      className={`${baseClasses} bg-bg-secondary text-text-secondary hover:bg-white/10 ring-1 ring-white/10`}
      title={questionId}
    >
      <div className="w-2 h-2 rounded-full bg-current" />
    </Link>
  );
}
