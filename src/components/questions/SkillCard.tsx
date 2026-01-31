import { Link } from 'react-router-dom';
import { SkillType } from '@/types';

interface SkillCardProps {
  skill: SkillType;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
}

export function SkillCard({ skill, name, icon, description, questionCount }: SkillCardProps) {
  return (
    <Link
      to={`/${skill}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-slate-200 hover:border-blue-300 hover:-translate-y-1"
    >
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
        <p className="text-slate-600 text-sm mb-4">{description}</p>
        <div className="text-sm text-slate-500">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </div>
      </div>
    </Link>
  );
}
