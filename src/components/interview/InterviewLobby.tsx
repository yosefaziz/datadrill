import { useEffect } from 'react';
import { useInterviewStore } from '@/stores/interviewStore';

export function InterviewLobby() {
  const { scenarios, scenariosLoading, fetchScenarios } = useInterviewStore();

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  if (scenariosLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Mock Interview</h1>
      <p className="text-text-secondary mb-8">Lobby placeholder - {scenarios.length} scenarios available</p>
    </div>
  );
}
