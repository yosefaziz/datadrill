import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReportStore } from '@/stores/reportStore';
import { useQuestionStore } from '@/stores/questionStore';
import { ReportCategory, ReportStatus, SkillType } from '@/types';

const STATUSES: { value: ReportStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'wrong_output', label: 'Wrong Output' },
  { value: 'unclear_description', label: 'Unclear Description' },
  { value: 'broken_test', label: 'Broken Test' },
  { value: 'typo', label: 'Typo' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  wrong_output: 'bg-error/15 text-error',
  unclear_description: 'bg-warning/15 text-warning',
  broken_test: 'bg-error/15 text-error',
  typo: 'bg-primary/15 text-primary',
  other: 'bg-text-muted/15 text-text-muted',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  new: 'text-primary',
  reviewing: 'text-warning',
  resolved: 'text-success',
  dismissed: 'text-text-muted',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function categoryLabel(category: ReportCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export function AdminReportsPage() {
  const adminReports = useReportStore((s) => s.adminReports);
  const adminHasMore = useReportStore((s) => s.adminHasMore);
  const adminIsLoading = useReportStore((s) => s.adminIsLoading);
  const adminFilters = useReportStore((s) => s.adminFilters);
  const adminTotalCount = useReportStore((s) => s.adminTotalCount);
  const fetchAdminReports = useReportStore((s) => s.fetchAdminReports);
  const setAdminFilter = useReportStore((s) => s.setAdminFilter);
  const updateReportStatus = useReportStore((s) => s.updateReportStatus);

  const questionsBySkill = useQuestionStore((s) => s.questionsBySkill);

  // Build question_id -> { skill, title } lookup from all loaded questions
  const questionLookup = useMemo(() => {
    const map: Record<string, { skill: SkillType; title: string }> = {};
    const skills = Object.keys(questionsBySkill) as SkillType[];
    for (const skill of skills) {
      for (const q of questionsBySkill[skill]) {
        map[q.id] = { skill, title: q.title };
      }
    }
    return map;
  }, [questionsBySkill]);

  useEffect(() => {
    fetchAdminReports(true);
  }, [adminFilters.category, adminFilters.showDismissed, adminFilters.showResolved, fetchAdminReports]);

  const handleLoadMore = () => {
    if (adminHasMore && !adminIsLoading) {
      fetchAdminReports();
    }
  };

  const categoryCounts = adminReports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Bug Reports</h1>
      <p className="text-text-secondary mb-6">
        Review reported issues from users. Total: {adminTotalCount} report{adminTotalCount !== 1 ? 's' : ''}.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-surface rounded-xl p-4 ring-1 ring-white/5">
          <p className="text-2xl font-bold text-text-primary">{adminTotalCount}</p>
          <p className="text-xs text-text-muted">Total</p>
        </div>
        {CATEGORIES.map((cat) => (
          <div key={cat.value} className="bg-surface rounded-xl p-4 ring-1 ring-white/5">
            <p className="text-2xl font-bold text-text-primary">{categoryCounts[cat.value] ?? '-'}</p>
            <p className="text-xs text-text-muted">{cat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <select
          value={adminFilters.category ?? ''}
          onChange={(e) => setAdminFilter('category', (e.target.value || null) as ReportCategory | null)}
          className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border-color focus:outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={adminFilters.showResolved}
            onChange={(e) => setAdminFilter('showResolved', e.target.checked)}
            className="accent-primary"
          />
          Show Resolved
        </label>

        <label className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={adminFilters.showDismissed}
            onChange={(e) => setAdminFilter('showDismissed', e.target.checked)}
            className="accent-primary"
          />
          Show Dismissed
        </label>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl ring-1 ring-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Question</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Category</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Reporter</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Details</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {adminReports.map((report) => {
                const questionInfo = questionLookup[report.question_id];
                return (
                  <tr key={report.id} className="border-b border-border-color last:border-b-0 hover:bg-bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {questionInfo ? (
                        <Link
                          to={`/${questionInfo.skill}/question/${report.question_id}`}
                          className="text-primary hover:text-primary-hover transition-colors"
                        >
                          {questionInfo.title}
                        </Link>
                      ) : (
                        <span className="text-text-primary font-mono text-xs">{report.question_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[report.category]}`}>
                        {categoryLabel(report.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={report.status}
                        onChange={(e) => updateReportStatus(report.id, e.target.value as ReportStatus)}
                        className={`bg-bg-secondary text-xs font-medium border border-border-color rounded-lg px-2 py-1 focus:outline-none focus:border-primary cursor-pointer ${STATUS_COLORS[report.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {report.profiles?.display_name ?? 'Anonymous'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-[240px] truncate">
                      {report.details || '-'}
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {formatDate(report.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Loading */}
        {adminIsLoading && adminReports.length === 0 && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Empty state */}
        {!adminIsLoading && adminReports.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No reports found.
          </div>
        )}

        {/* Load more */}
        {adminHasMore && adminReports.length > 0 && !adminIsLoading && (
          <div className="border-t border-border-color">
            <button
              onClick={handleLoadMore}
              className="w-full py-3 text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
