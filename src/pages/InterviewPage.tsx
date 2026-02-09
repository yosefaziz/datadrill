import { useParams, useLocation } from 'react-router-dom';
import { InterviewLobby } from '@/components/interview/InterviewLobby';

export function InterviewPage() {
  const { scenarioId } = useParams<{ scenarioId?: string }>();
  const location = useLocation();
  const isResults = location.pathname.endsWith('/results');

  if (!scenarioId) {
    return <InterviewLobby />;
  }

  if (isResults) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="text-text-secondary">Results view - coming soon</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center">
      <div className="text-text-secondary">Session view - coming soon</div>
    </div>
  );
}
