import { useState, useEffect, useCallback } from 'react';
import { RoundResult } from '@/types';

interface InterviewSessionHeaderProps {
  totalRounds: number;
  currentRoundIndex: number;
  roundResults: RoundResult[];
  timeMinutes: number;
  roundStartedAt: number;
  onTimeUp: () => void;
  onEndInterview: () => void;
}

export function InterviewSessionHeader({
  totalRounds,
  currentRoundIndex,
  roundResults,
  timeMinutes,
  roundStartedAt,
  onTimeUp,
  onEndInterview,
}: InterviewSessionHeaderProps) {
  const totalSeconds = timeMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  // Reset timer when round changes
  useEffect(() => {
    const elapsed = Math.floor((Date.now() - roundStartedAt) / 1000);
    setSecondsLeft(Math.max(0, totalSeconds - elapsed));
  }, [roundStartedAt, totalSeconds]);

  // Countdown interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roundStartedAt]);

  // Call onTimeUp when timer reaches 0
  useEffect(() => {
    if (secondsLeft === 0) {
      onTimeUp();
    }
  }, [secondsLeft, onTimeUp]);

  const handleEndInterview = useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to end the interview? Your progress on the current round will be lost.'
    );
    if (confirmed) {
      onEndInterview();
    }
  }, [onEndInterview]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let timerColor = 'text-text-primary';
  if (secondsLeft < 30) {
    timerColor = 'text-error';
  } else if (secondsLeft < 60) {
    timerColor = 'text-warning';
  }

  return (
    <div className="bg-surface rounded-xl p-4 flex items-center justify-between gap-4 shadow-lg ring-1 ring-white/5">
      {/* Round progress circles */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalRounds }, (_, i) => {
          let circleClass = 'bg-bg-secondary text-text-muted';

          if (i === currentRoundIndex) {
            circleClass = 'bg-primary text-white';
          } else if (i < roundResults.length) {
            circleClass = roundResults[i].passed
              ? 'bg-success text-white'
              : 'bg-error text-white';
          }

          return (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${circleClass}`}
              aria-label={`Round ${i + 1}${i === currentRoundIndex ? ' (current)' : ''}`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* Timer and end button */}
      <div className="flex items-center gap-4">
        <div className={`text-2xl font-mono font-bold ${timerColor}`} aria-label="Time remaining">
          {timerDisplay}
        </div>

        <button
          onClick={handleEndInterview}
          className="px-4 py-2 rounded-md text-sm font-medium bg-error/15 text-error hover:bg-error/25 transition-colors"
        >
          End Interview
        </button>
      </div>
    </div>
  );
}
