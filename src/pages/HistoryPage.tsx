import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { SubmissionCard } from '@/components/history/SubmissionCard';

export function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const submissions = useSubmissionStore((s) => s.submissions);
  const hasMore = useSubmissionStore((s) => s.hasMore);
  const isLoadingHistory = useSubmissionStore((s) => s.isLoadingHistory);
  const filters = useSubmissionStore((s) => s.filters);
  const fetchHistory = useSubmissionStore((s) => s.fetchHistory);
  const setFilter = useSubmissionStore((s) => s.setFilter);

  useEffect(() => {
    if (user) {
      fetchHistory(user.id, true);
    }
  }, [user, filters.skill, filters.passed, fetchHistory]);

  const handleLoadMore = () => {
    if (user && hasMore && !isLoadingHistory) {
      fetchHistory(user.id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Submission History</h1>
      <p className="text-text-secondary mb-6">Review your past submissions across all skills.</p>

      <div className="mb-6">
        <HistoryFilters
          skillFilter={filters.skill}
          passedFilter={filters.passed}
          onSkillChange={(v) => setFilter('skill', v)}
          onPassedChange={(v) => setFilter('passed', v)}
        />
      </div>

      <div className="space-y-2">
        {submissions.map((sub) => (
          <SubmissionCard key={sub.id} submission={sub} />
        ))}

        {isLoadingHistory && submissions.length === 0 && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!isLoadingHistory && submissions.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No submissions yet. Start practicing to see your history here.
          </div>
        )}

        {hasMore && submissions.length > 0 && !isLoadingHistory && (
          <button
            onClick={handleLoadMore}
            className="w-full py-2 text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
