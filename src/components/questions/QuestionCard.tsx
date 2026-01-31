import { Link } from 'react-router-dom';
import { QuestionMeta, SkillType } from '@/types';

interface QuestionCardProps {
  question: QuestionMeta;
  skill: SkillType;
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

export function QuestionCard({ question, skill }: QuestionCardProps) {
  return (
    <Link
      to={`/${skill}/question/${question.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-800">{question.title}</h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
