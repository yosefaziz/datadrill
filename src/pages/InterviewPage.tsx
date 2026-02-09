import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '@/stores/interviewStore';
import { useAuthStore } from '@/stores/authStore';
import { InterviewLobby } from '@/components/interview/InterviewLobby';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewResults } from '@/components/interview/InterviewResults';

export function InterviewPage() {
  const { scenarioId } = useParams<{ scenarioId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isResults = location.pathname.endsWith('/results');
  const { isComplete, fetchScenario, scenariosById, scenariosLoading } = useInterviewStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (scenarioId) {
      fetchScenario(scenarioId);
    }
  }, [scenarioId, fetchScenario]);

  if (!scenarioId) {
    return <InterviewLobby />;
  }

  if (isResults || isComplete) {
    return <InterviewResults />;
  }

  if (!user) {
    navigate('/interview');
    return null;
  }

  const scenario = scenariosById[scenarioId];
  if (!scenario && scenariosLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-text-secondary">Loading scenario...</div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-4">Scenario not found</div>
          <a href="/interview" className="text-primary hover:text-primary-hover transition-colors">
            Back to interviews
          </a>
        </div>
      </div>
    );
  }

  return <InterviewSession scenarioId={scenarioId} />;
}
