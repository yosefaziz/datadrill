import { Link } from 'react-router-dom';
import { QuestionMeta, SkillType } from '@/types';

interface QuestionCardProps {
  question: QuestionMeta;
  skill: SkillType;
  className?: string;
}

const difficultyColors = {
  Easy: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  Hard: 'bg-error/20 text-error',
};

const questionTypeColors = {
  constraints: 'bg-info/20 text-info',
  canvas: 'bg-accent/20 text-accent',
  quiz: 'bg-primary/20 text-primary',
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
      className={`block bg-surface rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-border neon-glow-hover ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-text-primary">{question.title}</h3>
          {question.questionType && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                questionTypeColors[question.questionType]
              }`}
            >
              {questionTypeLabels[question.questionType]}
            </span>
          )}
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
            difficultyColors[question.difficulty]
          }`}
        >
          {question.difficulty}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-bg-secondary text-text-secondary rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
