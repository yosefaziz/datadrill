import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '@/stores/interviewStore';
import { useAuthStore } from '@/stores/authStore';
import { InterviewRoundResult } from './InterviewRoundResult';

const LEVEL_LABELS: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
};

const CATEGORY_LABELS: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System Design',
};

function formatTotalTime(startedAt: number | null): string {
  if (!startedAt) return '--';
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${minutes}m ${seconds}s`;
}

export function InterviewResults() {
  const navigate = useNavigate();
  const { activeScenario, roundResults, sessionStartedAt, resetSession, getOverallScore, saveSessionToSupabase } =
    useInterviewStore();
  const user = useAuthStore((s) => s.user);
  const savedRef = useRef(false);
  const [copied, setCopied] = useState(false);

  // Save to Supabase on mount (only once)
  useEffect(() => {
    if (user && !savedRef.current) {
      savedRef.current = true;
      saveSessionToSupabase(user.id);
    }
  }, [user, saveSessionToSupabase]);

  const handleShare = useCallback(() => {
    if (!activeScenario) return;

    const score = getOverallScore();
    const passed = roundResults.filter((r) => r.passed).length;
    const total = activeScenario.rounds.length;
    const catLabel = CATEGORY_LABELS[activeScenario.category] || activeScenario.category;
    const lvlLabel = LEVEL_LABELS[activeScenario.level] || activeScenario.level;

    const roundLines = activeScenario.rounds.map((round, i) => {
      const r = roundResults.find((rr) => rr.roundId === round.id);
      const status = r ? (r.passed ? 'Pass' : 'Fail') : 'Skipped';
      return `  ${i + 1}. ${round.title} - ${status}`;
    });

    const text = [
      `DataDrill Mock Interview Results`,
      `${activeScenario.title} (${catLabel} - ${lvlLabel})`,
      `Score: ${Math.round(score * 100)}% | Rounds: ${passed}/${total} passed`,
      ``,
      `Rounds:`,
      ...roundLines,
      ``,
      `Try it yourself at https://thedatadrill.vercel.app/interview`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeScenario, roundResults, getOverallScore]);

  // Edge case: no active scenario
  if (!activeScenario) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="text-text-secondary mb-4">No interview session found.</div>
        <Link
          to="/interview"
          className="text-primary hover:text-primary-hover transition-colors font-medium"
        >
          Back to interviews
        </Link>
      </div>
    );
  }

  const overallScore = getOverallScore();
  const roundsPassed = roundResults.filter((r) => r.passed).length;
  const totalRounds = activeScenario.rounds.length;

  // Average score of submitted rounds only
  const averageScore =
    roundResults.length > 0
      ? roundResults.reduce((sum, r) => sum + r.score, 0) / roundResults.length
      : 0;

  // Score color
  let scoreColorClass = 'text-error';
  if (overallScore >= 0.8) {
    scoreColorClass = 'text-success';
  } else if (overallScore >= 0.5) {
    scoreColorClass = 'text-warning';
  }

  const categoryLabel = CATEGORY_LABELS[activeScenario.category] || activeScenario.category;
  const levelLabel = LEVEL_LABELS[activeScenario.level] || activeScenario.level;

  const handleTryAnother = () => {
    resetSession();
    navigate('/interview');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/interview"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors mb-4"
          onClick={(e) => {
            e.preventDefault();
            handleTryAnother();
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to interviews
        </Link>

        <h1 className="text-2xl font-bold text-text-primary mb-2">{activeScenario.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">
            {categoryLabel}
          </span>
          <span className="text-sm font-medium px-2 py-0.5 rounded bg-bg-secondary text-text-secondary">
            {levelLabel}
          </span>
        </div>
      </div>

      {/* Score circle */}
      <div className="flex justify-center mb-8">
        <svg className="w-32 h-32" viewBox="0 0 36 36">
          <path
            className="text-bg-secondary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={scoreColorClass}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${Math.round(overallScore * 100)}, 100`}
            strokeLinecap="round"
          />
          <text x="18" y="20.5" className="fill-text-primary text-[0.5em] font-bold" textAnchor="middle">
            {Math.round(overallScore * 100)}%
          </text>
        </svg>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-secondary rounded-lg p-3 text-center">
          <div className="text-sm text-text-secondary mb-1">Rounds Passed</div>
          <div className="text-xl font-bold text-text-primary">
            {roundsPassed}/{totalRounds}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg p-3 text-center">
          <div className="text-sm text-text-secondary mb-1">Total Time</div>
          <div className="text-xl font-bold text-text-primary">
            {formatTotalTime(sessionStartedAt)}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg p-3 text-center">
          <div className="text-sm text-text-secondary mb-1">Average Score</div>
          <div className="text-xl font-bold text-text-primary">
            {Math.round(averageScore * 100)}%
          </div>
        </div>
      </div>

      {/* Round breakdown */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Round Breakdown</h2>
        <div className="flex flex-col gap-3">
          {activeScenario.rounds.map((round, index) => {
            const result = roundResults.find((r) => r.roundId === round.id);
            return (
              <InterviewRoundResult
                key={round.id}
                roundIndex={index}
                round={round}
                result={result}
              />
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleTryAnother}
          className="bg-primary text-white rounded-lg px-6 py-3 font-medium hover:bg-primary-hover transition-colors"
        >
          Try Another Interview
        </button>
        <button
          onClick={handleShare}
          className="bg-bg-secondary text-text-secondary rounded-lg px-6 py-3 font-medium hover:text-text-primary transition-colors"
        >
          {copied ? 'Copied!' : 'Share Results'}
        </button>
      </div>
    </div>
  );
}
