import { InterviewRound } from '@/types';
import { InterviewQuizRound } from './InterviewQuizRound';
import { InterviewCodeRound } from './InterviewCodeRound';

interface InterviewRoundViewProps {
  round: InterviewRound;
  onSubmit: (passed: boolean, score: number, answer: string) => void;
}

export function InterviewRoundView({ round, onSubmit }: InterviewRoundViewProps) {
  if (round.questionType === 'quiz' && round.questions) {
    return <InterviewQuizRound questions={round.questions} onSubmit={onSubmit} />;
  }

  return <InterviewCodeRound round={round} onSubmit={onSubmit} />;
}
