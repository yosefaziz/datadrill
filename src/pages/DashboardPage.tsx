import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useStatsStore } from '@/stores/statsStore';
import { RadarChart } from '@/components/stats/RadarChart';
import { SkillBreakdown } from '@/components/stats/SkillBreakdown';
import { StatsCards } from '@/components/stats/StatsCards';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const stats = useStatsStore((s) => s.stats);
  const selectedSkill = useStatsStore((s) => s.selectedSkill);
  const isLoading = useStatsStore((s) => s.isLoading);
  const fetchStats = useStatsStore((s) => s.fetchStats);
  const setSelectedSkill = useStatsStore((s) => s.setSelectedSkill);

  useEffect(() => {
    if (user) {
      fetchStats(user.id);
    }
  }, [user, fetchStats]);

  const selectedStats = stats?.skills.find((s) => s.skill === selectedSkill);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {profile?.display_name ? `Welcome back, ${profile.display_name}` : 'Dashboard'}
        </h1>
        <p className="text-text-secondary mt-1">Track your progress across all skills.</p>
      </div>

      {isLoading && !stats ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats ? (
        <div className="space-y-8">
          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface rounded-xl p-6 ring-1 ring-white/5">
              <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
                Skill Radar
              </h3>
              <p className="text-xs text-text-muted text-center mb-4">
                Click a skill to see the breakdown
              </p>
              <RadarChart
                skills={stats.skills}
                onSkillClick={(skill) =>
                  setSelectedSkill(skill === selectedSkill ? null : skill)
                }
                selectedSkill={selectedSkill}
              />
            </div>

            {selectedStats ? (
              <SkillBreakdown stats={selectedStats} />
            ) : (
              <div className="bg-surface rounded-xl p-6 ring-1 ring-white/5 flex items-center justify-center">
                <div className="text-center text-text-muted">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-sm">Click a skill on the radar chart</div>
                  <div className="text-xs mt-1">to see difficulty breakdown</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          No data yet. Start practicing to see your stats.
        </div>
      )}
    </div>
  );
}
