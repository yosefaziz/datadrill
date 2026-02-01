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
    <div className="flex-1 p-4 h-full">
      <div className="h-full min-h-0 flex gap-4">
        {/* Left Panel - Question */}
        <div className="w-1/2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <Link
              to="/architecture"
              className="text-blue-600 hover:text-blue-800 text-sm mb-3 inline-block"
            >
              &larr; All Questions
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Quiz
              </span>
              {question.multiSelect && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                  Multiple Answers
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{question.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  question.difficulty === 'Easy'
                    ? 'bg-green-100 text-green-700'
                    : question.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {question.difficulty}
              </span>
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 whitespace-pre-wrap">
                {question.question}
              </p>
              {question.description && (
                <div
                  className="text-slate-600 mt-4"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Answers */}
        <div className="w-1/2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
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
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    hasSelection
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-600 text-white hover:bg-slate-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {question.answers.map((answer) => {
                const isSelected = selectedAnswers.includes(answer.id);
                const result = validationResult?.answerResults.find(
                  (r) => r.answerId === answer.id
                );

                let borderColor = 'border-slate-200';
                let bgColor = 'bg-white';
                let textColor = 'text-slate-800';

                if (isSubmitted && result) {
                  if (result.isCorrect) {
                    borderColor = 'border-green-400';
                    bgColor = result.wasSelected ? 'bg-green-50' : 'bg-green-50/50';
                    textColor = 'text-green-800';
                  } else if (result.wasSelected) {
                    borderColor = 'border-red-400';
                    bgColor = 'bg-red-50';
                    textColor = 'text-red-800';
                  }
                } else if (isSelected) {
                  borderColor = 'border-blue-400';
                  bgColor = 'bg-blue-50';
                }

                return (
                  <button
                    key={answer.id}
                    onClick={() => toggleAnswer(answer.id, question.multiSelect)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${borderColor} ${bgColor} ${
                      isSubmitted ? 'cursor-default' : 'hover:border-blue-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 ${question.multiSelect ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? isSubmitted
                              ? result?.isCorrect
                                ? 'border-green-500 bg-green-500'
                                : 'border-red-500 bg-red-500'
                              : 'border-blue-500 bg-blue-500'
                            : isSubmitted && result?.isCorrect
                              ? 'border-green-500'
                              : 'border-slate-300'
                        }`}
                      >
                        {question.multiSelect ? (
                          // Checkbox style - checkmark for multi-select
                          (isSelected || (isSubmitted && result?.isCorrect)) && (
                            <svg
                              className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-green-500'}`}
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
                                  : 'bg-green-500'
                              }`}
                            />
                          )
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${textColor}`}>{answer.text}</div>
                        {isSubmitted && result?.explanation && (
                          <div className="text-sm text-slate-600 mt-2 italic">
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
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Explanation</h4>
                <p className="text-slate-600">{validationResult.overallExplanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
