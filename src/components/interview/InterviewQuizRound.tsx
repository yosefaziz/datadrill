import { useState } from 'react';
import { InterviewQuizOption } from '@/types';

interface InterviewQuizRoundProps {
  questions: InterviewQuizOption[];
  onSubmit: (passed: boolean, score: number, answer: string) => void;
}

export function InterviewQuizRound({ questions, onSubmit }: InterviewQuizRoundProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!allAnswered || isSubmitted) return;
    setIsSubmitted(true);

    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] === questions[i].correctAnswer) {
        correctCount++;
      }
    }

    const score = correctCount / questions.length;
    const allCorrect = correctCount === questions.length;
    onSubmit(allCorrect, score, JSON.stringify(selectedAnswers));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {questions.map((q, qIndex) => {
          const isCorrect = isSubmitted && selectedAnswers[qIndex] === q.correctAnswer;
          const isWrong = isSubmitted && selectedAnswers[qIndex] !== q.correctAnswer;

          return (
            <div key={qIndex} className="bg-surface rounded-lg p-5 ring-1 ring-white/5">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                  {qIndex + 1}
                </span>
                <p className="text-text-primary font-medium">{q.question}</p>
              </div>

              {isSubmitted && (
                <div className="flex items-center gap-2 mb-3 ml-10">
                  {isCorrect ? (
                    <span className="text-sm font-medium text-success">Correct</span>
                  ) : (
                    <span className="text-sm font-medium text-error">Incorrect</span>
                  )}
                </div>
              )}

              <div className="space-y-2 ml-10" role="radiogroup" aria-label={`Question ${qIndex + 1}`}>
                {q.options.map((option, oIndex) => {
                  const isSelected = selectedAnswers[qIndex] === oIndex;
                  const isCorrectOption = oIndex === q.correctAnswer;

                  let borderClass = 'border-border bg-surface';
                  let radioClass = 'border-border';

                  if (isSubmitted) {
                    if (isCorrectOption && isSelected) {
                      borderClass = 'border-success bg-success/10';
                      radioClass = 'border-success bg-success';
                    } else if (isSelected && !isCorrectOption) {
                      borderClass = 'border-error bg-error/10';
                      radioClass = 'border-error bg-error';
                    } else if (isCorrectOption && !isSelected) {
                      borderClass = 'border-success/50';
                      radioClass = 'border-success';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-primary bg-primary/10';
                    radioClass = 'border-primary bg-primary';
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleSelect(qIndex, oIndex)}
                      disabled={isSubmitted}
                      role="radio"
                      aria-checked={isSelected}
                      className={`w-full border-2 rounded-lg p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${borderClass} ${
                        isSubmitted ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${radioClass}`}
                          aria-hidden="true"
                        >
                          {(isSelected || (isSubmitted && isCorrectOption)) && (
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-success'
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isSubmitted && isCorrectOption
                              ? 'text-success font-medium'
                              : isSubmitted && isSelected && !isCorrectOption
                                ? 'text-error'
                                : 'text-text-primary'
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSubmitted && q.explanation && (
                <div className="text-sm text-text-secondary italic mt-2 ml-10">
                  {q.explanation}
                </div>
              )}

              {isWrong && isSubmitted && (
                <div className="text-xs text-text-muted mt-1 ml-10">
                  Correct answer: {q.options[q.correctAnswer]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="flex-shrink-0 p-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              allAnswered
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-border text-text-muted cursor-not-allowed'
            }`}
          >
            Submit Answers ({Object.keys(selectedAnswers).length}/{questions.length} answered)
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="text-center text-sm text-text-secondary">
            Score: {questions.filter((_, i) => selectedAnswers[i] === questions[i].correctAnswer).length}/{questions.length} correct
          </div>
        </div>
      )}
    </div>
  );
}
