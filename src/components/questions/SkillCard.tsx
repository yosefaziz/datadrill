import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SkillType } from '@/types';

interface SkillCardProps {
  skill: SkillType;
  name: string;
  Icon: LucideIcon;
  description: string;
  questionCount: number;
  className?: string;
}

export function SkillCard({ skill, name, Icon, description, questionCount, className = '' }: SkillCardProps) {
  return (
    <Link
      to={`/${skill}`}
      className={`block bg-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-border hover:border-primary hover:-translate-y-1 neon-glow-hover ${className}`}
    >
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{name}</h3>
        <p className="text-text-secondary text-sm mb-4">{description}</p>
        <div className="text-sm text-text-muted">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </div>
      </div>
    </Link>
  );
}
