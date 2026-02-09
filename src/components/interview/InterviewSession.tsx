import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '@/stores/interviewStore';
import { InterviewSessionHeader } from './InterviewSessionHeader';
import { InterviewRoundView } from './InterviewRoundView';

interface InterviewSessionProps {
  scenarioId: string;
}

export function InterviewSession({ scenarioId }: InterviewSessionProps) {
  const navigate = useNavigate();
  const {
    activeScenario,
    currentRoundIndex,
    roundResults,
    roundStartedAt,
    isComplete,
    startSession,
    submitRound,
    nextRound,
    endSession,
    getCurrentRound,
    scenariosById,
  } = useInterviewStore();

  const startedRef = useRef(false);

  // Start session on mount if not already active
  useEffect(() => {
    if (startedRef.current) return;

    const scenario = scenariosById[scenarioId];
    if (!scenario) return;

    if (!activeScenario || activeScenario.id !== scenarioId) {
      startedRef.current = true;
      startSession(scenarioId);
    } else {
      startedRef.current = true;
    }
  }, [scenarioId, scenariosById, activeScenario, startSession]);

  // Navigate to results when complete
  useEffect(() => {
    if (isComplete) {
      navigate(`/interview/${scenarioId}/results`);
    }
  }, [isComplete, scenarioId, navigate]);

  const handleRoundSubmit = useCallback(
    (passed: boolean, score: number, answer: string) => {
      const roundStart = roundStartedAt || Date.now();
      const timeSpentSeconds = Math.floor((Date.now() - roundStart) / 1000);

      submitRound({
        passed,
        score,
        timeSpentSeconds,
        answer,
        resultMeta: null,
      });

      nextRound();
    },
    [roundStartedAt, submitRound, nextRound]
  );

  const handleTimeUp = useCallback(() => {
    const roundStart = roundStartedAt || Date.now();
    const timeSpentSeconds = Math.floor((Date.now() - roundStart) / 1000);

    submitRound({
      passed: false,
      score: 0,
      timeSpentSeconds,
      answer: '',
      resultMeta: null,
    });

    nextRound();
  }, [roundStartedAt, submitRound, nextRound]);

  const handleEndInterview = useCallback(() => {
    endSession();
  }, [endSession]);

  const currentRound = getCurrentRound();

  if (!activeScenario || !currentRound || !roundStartedAt) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-text-secondary">Preparing interview session...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 h-full overflow-hidden">
      <InterviewSessionHeader
        totalRounds={activeScenario.rounds.length}
        currentRoundIndex={currentRoundIndex}
        roundResults={roundResults}
        timeMinutes={currentRound.timeMinutes}
        roundStartedAt={roundStartedAt}
        onTimeUp={handleTimeUp}
        onEndInterview={handleEndInterview}
      />

      <InterviewRoundView
        key={currentRound.id}
        round={currentRound}
        onSubmit={handleRoundSubmit}
      />
    </div>
  );
}
