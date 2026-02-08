import { Link } from 'react-router-dom';
import { Submission } from '@/types';

interface SubmissionCardProps {
  submission: Submission;
}

const SKILL_LABELS: Record<string, string> = {
  sql: 'SQL',
  python: 'Python',
  debug: 'Debug',
  architecture: 'Architecture',
  modeling: 'Modeling',
};

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const date = new Date(submission.created_at);
  const timeAgo = getTimeAgo(date);

  return (
    <Link
      to={`/${submission.skill}/question/${submission.question_id}`}
      className="block bg-surface rounded-lg p-4 ring-1 ring-white/5 hover:ring-primary/30 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              submission.passed ? 'bg-success' : 'bg-error'
            }`}
          />
          <div>
            <div className="text-sm font-medium text-text-primary">
              {submission.question_id}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text-muted">
                {SKILL_LABELS[submission.skill] || submission.skill}
              </span>
              <span className="text-xs text-text-muted">·</span>
              <span
                className={`text-xs font-medium ${
                  submission.difficulty === 'Easy'
                    ? 'text-success'
                    : submission.difficulty === 'Medium'
                      ? 'text-warning'
                      : 'text-error'
                }`}
              >
                {submission.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-text-muted">{timeAgo}</div>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
