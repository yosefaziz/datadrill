import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuizQuestion } from '@/types';
import { useQuizStore } from '@/stores/quizStore';
import { validateQuizQuestion } from '@/services/validation/QuizValidator';

interface QuizQuestionViewProps {
  question: QuizQuestion;
}

export function QuizQuestionView({ question }: QuizQuestionViewProps) {
  const {
    selectedAnswers,
    validationResult,
    isSubmitted,
    toggleAnswer,
    setValidationResult,
    reset,
  } = useQuizStore();

  useEffect(() => {
    reset();
  }, [question.id, reset]);

  const handleSubmit = () => {
    const result = validateQuizQuestion(question, selectedAnswers);
    setValidationResult(result);
  };

  const handleReset = () => {
    reset();
  };

  const hasSelection = selectedAnswers.length > 0;

  return (
    <div className="flex-1 p-4 h-full overflow-hidden">
      <div className="h-full min-h-0 flex gap-4">
        {/* Left Panel - Question */}
        <div className="w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <Link
              to="/architecture"
              className="text-primary hover:text-primary-hover text-sm mb-3 inline-block transition-colors duration-200"
            >
              &larr; All Questions
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-info/20 text-info">
                Quiz
              </span>
              {question.multiSelect && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-warning/20 text-warning">
                  Multiple Answers
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{question.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  question.difficulty === 'Easy'
                    ? 'bg-success/20 text-success'
                    : question.difficulty === 'Medium'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-error/20 text-error'
                }`}
              >
                {question.difficulty}
              </span>
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-bg-secondary text-text-secondary px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-slate max-w-none prose-invert">
              <p className="text-lg text-text-primary whitespace-pre-wrap">
                {question.question}
              </p>
              {question.description && (
                <div
                  className="text-text-secondary mt-4"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Answers */}
        <div className="w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {isSubmitted
                  ? validationResult?.passed
                    ? 'Correct!'
                    : 'Incorrect'
                  : question.multiSelect
                    ? 'Select all that apply'
                    : 'Select one answer'}
              </div>
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!hasSelection}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    hasSelection
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-accent text-white hover:bg-accent-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div
              className="space-y-3"
              role={question.multiSelect ? 'group' : 'radiogroup'}
              aria-label={question.multiSelect ? 'Select all correct answers' : 'Select the correct answer'}
            >
              {question.answers.map((answer) => {
                const isSelected = selectedAnswers.includes(answer.id);
                const result = validationResult?.answerResults.find(
                  (r) => r.answerId === answer.id
                );

                let borderColor = 'border-border';
                let bgColor = 'bg-surface';
                let textColor = 'text-text-primary';

                if (isSubmitted && result) {
                  if (result.isCorrect) {
                    borderColor = 'border-success';
                    bgColor = result.wasSelected ? 'bg-success/10' : 'bg-success/5';
                    textColor = 'text-success';
                  } else if (result.wasSelected) {
                    borderColor = 'border-error';
                    bgColor = 'bg-error/10';
                    textColor = 'text-error';
                  }
                } else if (isSelected) {
                  borderColor = 'border-primary';
                  bgColor = 'bg-primary/10';
                }

                return (
                  <button
                    key={answer.id}
                    onClick={() => toggleAnswer(answer.id, question.multiSelect)}
                    disabled={isSubmitted}
                    role={question.multiSelect ? 'checkbox' : 'radio'}
                    aria-checked={isSelected}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${borderColor} ${bgColor} ${
                      isSubmitted ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 ${question.multiSelect ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? isSubmitted
                              ? result?.isCorrect
                                ? 'border-success bg-success'
                                : 'border-error bg-error'
                              : 'border-primary bg-primary'
                            : isSubmitted && result?.isCorrect
                              ? 'border-success'
                              : 'border-border'
                        }`}
                        aria-hidden="true"
                      >
                        {question.multiSelect ? (
                          // Checkbox style - checkmark for multi-select
                          (isSelected || (isSubmitted && result?.isCorrect)) && (
                            <svg
                              className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-success'}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )
                        ) : (
                          // Radio style - filled dot for single-select
                          (isSelected || (isSubmitted && result?.isCorrect)) && (
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isSelected
                                  ? 'bg-white'
                                  : 'bg-success'
                              }`}
                            />
                          )
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${textColor}`}>{answer.text}</div>
                        {isSubmitted && result?.explanation && (
                          <div className="text-sm text-text-secondary mt-2 italic">
                            {result.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {isSubmitted && validationResult?.overallExplanation && (
              <div className="mt-6 p-4 bg-bg-secondary rounded-lg border border-border">
                <h4 className="font-semibold text-text-primary mb-2">Explanation</h4>
                <p className="text-text-secondary">{validationResult.overallExplanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
