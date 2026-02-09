import { ReactNode } from 'react';
import { Question, isDebugQuestion } from '@/types';
import { ReactionButtons } from './ReactionButtons';

interface QuestionHeaderProps {
  question: Question;
  children?: ReactNode;
}

const difficultyColors = {
  Easy: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  Hard: 'bg-error/20 text-error',
};

const skillBadges = {
  sql: { bg: 'bg-info/20', text: 'text-info', label: 'SQL' },
  python: { bg: 'bg-warning/20', text: 'text-warning', label: 'Python' },
  debug: { bg: 'bg-accent/20', text: 'text-accent', label: 'Debug' },
  architecture: { bg: 'bg-primary/20', text: 'text-primary', label: 'Architecture' },
  modeling: { bg: 'bg-success/20', text: 'text-success', label: 'Modeling' },
};

export function QuestionHeader({ question, children }: QuestionHeaderProps) {
  const isDebug = isDebugQuestion(question);
  const skillBadge = skillBadges[question.skill];

  return (
    <div className="p-4 border-b border-border-color flex-shrink-0">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold text-text-primary leading-tight">{question.title}</h1>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ReactionButtons questionId={question.id} />
          {children}
        </div>
      </div>
      <div className="flex items-center flex-wrap gap-2 mt-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${skillBadge.bg} ${skillBadge.text}`}
        >
          {skillBadge.label}
          {isDebug && ` (${question.language.toUpperCase()})`}
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[question.difficulty]}`}
        >
          {question.difficulty}
        </span>
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-bg-secondary text-text-secondary rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
