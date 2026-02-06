import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';

interface PreviousAttemptsProps {
  questionId: string;
}

export function PreviousAttempts({ questionId }: PreviousAttemptsProps) {
  const user = useAuthStore((s) => s.user);
  const { questionSubmissions, isLoadingQuestion, fetchQuestionSubmissions } = useSubmissionStore();

  useEffect(() => {
    if (user) {
      fetchQuestionSubmissions(user.id, questionId);
    }
  }, [user, questionId, fetchQuestionSubmissions]);

  if (!user || questionSubmissions.length === 0) return null;

  return (
    <div className="border-t border-border pt-3 mt-3">
      <h4 className="text-xs font-medium text-text-muted mb-2">
        Previous Attempts ({questionSubmissions.length})
      </h4>
      {isLoadingQuestion ? (
        <div className="text-xs text-text-muted">Loading...</div>
      ) : (
        <div className="space-y-1">
          {questionSubmissions.slice(0, 5).map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sub.passed ? 'bg-success' : 'bg-error'
                }`}
              />
              <span className="text-text-secondary">
                {sub.passed ? 'Passed' : 'Failed'}
              </span>
              <span className="text-text-muted">
                {new Date(sub.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
