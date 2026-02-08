import { Link } from 'react-router-dom';
import { QuestionMeta, SkillType } from '@/types';

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

const questionTypeColors = {
  constraints: 'bg-info/10 text-info',
  canvas: 'bg-accent/10 text-accent',
  quiz: 'bg-primary/10 text-primary',
};

const questionTypeLabels = {
  constraints: 'Constraints',
  canvas: 'Canvas',
  quiz: 'Quiz',
};

export function QuestionCard({ question, skill, className = '' }: QuestionCardProps) {
  return (
    <Link
      to={`/${skill}/question/${question.id}`}
      className={`flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150 ${className}`}
    >
      {/* Difficulty dot + label */}
      <span className={`text-xs font-medium w-14 shrink-0 ${difficultyColors[question.difficulty]}`}>
        {question.difficulty}
      </span>

      {/* Title + type badge */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {question.title}
        </span>
        {question.questionType && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
              questionTypeColors[question.questionType]
            }`}
          >
            {questionTypeLabels[question.questionType]}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        {question.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-bg-secondary text-text-muted rounded text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
