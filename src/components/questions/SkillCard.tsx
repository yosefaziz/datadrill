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
      className={`block bg-surface rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:-translate-y-1 ring-1 ring-white/5 hover:ring-primary/50 ${className}`}
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
