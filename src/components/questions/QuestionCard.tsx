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

const questionTypeColors = {
  constraints: 'bg-blue-100 text-blue-800',
  canvas: 'bg-purple-100 text-purple-800',
};

const questionTypeLabels = {
  constraints: 'Constraints',
  canvas: 'Canvas',
};

export function QuestionCard({ question, skill }: QuestionCardProps) {
  return (
    <Link
      to={`/${skill}/question/${question.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-800">{question.title}</h3>
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
            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
