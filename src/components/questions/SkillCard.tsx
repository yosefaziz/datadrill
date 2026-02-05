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
      className="block bg-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-border hover:border-primary hover:-translate-y-1 neon-glow-hover"
    >
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{name}</h3>
        <p className="text-text-secondary text-sm mb-4">{description}</p>
        <div className="text-sm text-text-muted">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </div>
      </div>
    </Link>
  );
}
