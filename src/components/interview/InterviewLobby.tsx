import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInterviewStore } from '@/stores/interviewStore';
import { useAuthGate } from '@/hooks/useAuthGate';
import { InterviewCategory, InterviewLevel, InterviewScenarioMeta } from '@/types';

const LEVELS: { key: InterviewLevel; label: string; badgeClass: string }[] = [
  { key: 'junior', label: 'Junior', badgeClass: 'bg-success/20 text-success' },
  { key: 'mid', label: 'Mid', badgeClass: 'bg-warning/20 text-warning' },
  { key: 'senior', label: 'Senior', badgeClass: 'bg-orange-500/20 text-orange-400' },
  { key: 'staff', label: 'Staff', badgeClass: 'bg-error/20 text-error' },
];

const CATEGORIES: {
  key: InterviewCategory;
  label: string;
  description: string;
}[] = [
  {
    key: 'coding',
    label: 'Coding Interview',
    description:
      'SQL queries, Python transformations, and debugging challenges - timed rounds that simulate real technical screens.',
  },
  {
    key: 'system_design',
    label: 'System Design Interview',
    description:
      'Architecture discussions, trade-off analysis, and schema design - practice explaining your reasoning under pressure.',
  },
];

function CategoryIcon({ category }: { category: InterviewCategory }) {
  if (category === 'coding') {
    return (
      <svg
        className="w-6 h-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }

  return (
    <svg
      className="w-6 h-6 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl p-5 shadow-lg ring-1 ring-white/5 animate-pulse">
      <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 bg-white/5 rounded w-16" />
        <div className="h-4 bg-white/5 rounded w-12" />
      </div>
    </div>
  );
}

interface ScenarioCardProps {
  scenario: InterviewScenarioMeta;
  isAuthenticated: boolean;
  requireAuth: () => boolean;
}

function ScenarioCard({ scenario, isAuthenticated, requireAuth }: ScenarioCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      requireAuth();
    }
  };

  return (
    <Link
      to={`/interview/${scenario.id}`}
      onClick={handleClick}
      className="group bg-surface rounded-xl p-5 shadow-lg ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/30"
    >
      <h4 className="text-base font-semibold text-text-primary mb-1.5 group-hover:text-primary transition-colors">
        {scenario.title}
      </h4>
      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
        {scenario.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {scenario.estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          {scenario.roundCount} {scenario.roundCount === 1 ? 'round' : 'rounds'}
        </span>
      </div>
      {scenario.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scenario.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function InterviewLobby() {
  const { scenarios, scenariosLoading, fetchScenarios } = useInterviewStore();
  const { isAuthenticated, requireAuth } = useAuthGate();

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const grouped = useMemo(() => {
    const map: Record<InterviewCategory, Record<InterviewLevel, InterviewScenarioMeta[]>> = {
      coding: { junior: [], mid: [], senior: [], staff: [] },
      system_design: { junior: [], mid: [], senior: [], staff: [] },
    };

    for (const scenario of scenarios) {
      if (map[scenario.category]?.[scenario.level]) {
        map[scenario.category][scenario.level].push(scenario);
      }
    }

    return map;
  }, [scenarios]);

  if (scenariosLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="h-9 bg-white/10 rounded w-64 mx-auto mb-3 animate-pulse" />
          <div className="h-5 bg-white/5 rounded w-96 mx-auto animate-pulse" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="mb-12">
            <div className="h-7 bg-white/10 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-80 mb-6 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, j) => (
                <SkeletonCard key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold text-text-primary mb-3">Mock Interview</h1>
          <p className="text-text-secondary">
            Simulate real data engineering interviews with timed, multi-round scenarios.
          </p>
        </div>
        <div className="text-center py-16 animate-fade-in">
          <svg
            className="w-12 h-12 text-text-muted mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-text-secondary text-lg">No interview scenarios available yet.</p>
          <p className="text-text-muted text-sm mt-1">Check back soon - new scenarios are being added.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-3xl font-bold text-text-primary mb-3">Mock Interview</h1>
        <p className="text-text-secondary">
          Simulate real data engineering interviews with timed, multi-round scenarios.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat.key} className="mb-14 animate-fade-in">
          <div className="flex items-center gap-3 mb-1.5">
            <CategoryIcon category={cat.key} />
            <h2 className="text-2xl font-bold text-text-primary">{cat.label}</h2>
          </div>
          <p className="text-text-secondary text-sm mb-6 ml-9">
            {cat.description}
          </p>

          {LEVELS.map((level) => {
            const levelScenarios = grouped[cat.key][level.key];

            return (
              <div key={level.key} className="mb-8 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${level.badgeClass}`}
                  >
                    {level.label}
                  </span>
                </div>

                {levelScenarios.length === 0 ? (
                  <p className="text-text-muted text-sm ml-1">Coming soon</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {levelScenarios.map((scenario) => (
                      <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        isAuthenticated={isAuthenticated}
                        requireAuth={requireAuth}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
