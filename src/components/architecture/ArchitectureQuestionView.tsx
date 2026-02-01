import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConstraintsQuestion } from '@/types';
import { useArchitectureStore } from '@/stores/architectureStore';
import { QuestionSelectionPhase } from './QuestionSelectionPhase';
import { ArchitectureSelectionPhase } from './ArchitectureSelectionPhase';
import { ArchitectureFeedback } from './ArchitectureFeedback';

interface ArchitectureQuestionViewProps {
  question: ConstraintsQuestion;
}

export function ArchitectureQuestionView({ question }: ArchitectureQuestionViewProps) {
  const { phase, reset } = useArchitectureStore();

  // Reset state when question changes
  useEffect(() => {
    reset();
  }, [question.id, reset]);

  return (
    <div className="flex-1 p-4">
      <div className="h-full flex gap-4">
        {/* Left Panel - Question Description */}
        <div className="w-2/5 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <Link
              to="/architecture"
              className="text-blue-600 hover:text-blue-800 text-sm mb-3 inline-block"
            >
              &larr; All Questions
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">{question.title}</h1>
            <div className="flex items-center gap-3 mt-2">
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
              <h3 className="text-lg font-semibold mb-3">Scenario</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{question.prompt}</p>

              {question.guidance && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-3">Guidance</h3>
                  <div
                    className="text-slate-600"
                    dangerouslySetInnerHTML={{ __html: question.guidance }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Interactive Area */}
        <div className="w-3/5 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          {/* Phase Indicator */}
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-4">
              {(['questions', 'architecture', 'feedback'] as const).map((p, idx) => (
                <div key={p} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      phase === p
                        ? 'bg-blue-600 text-white'
                        : idx <
                            ['questions', 'architecture', 'feedback'].indexOf(phase)
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {idx <
                    ['questions', 'architecture', 'feedback'].indexOf(phase) ? (
                      <svg
                        className="w-4 h-4"
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
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      phase === p ? 'text-slate-800 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {p === 'questions'
                      ? 'Ask Questions'
                      : p === 'architecture'
                        ? 'Choose Architecture'
                        : 'Review Feedback'}
                  </span>
                  {idx < 2 && (
                    <div className="w-8 h-px bg-slate-300 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Phase Content */}
          <div className="flex-1 overflow-y-auto">
            {phase === 'questions' && <QuestionSelectionPhase question={question} />}
            {phase === 'architecture' && (
              <ArchitectureSelectionPhase question={question} />
            )}
            {phase === 'feedback' && <ArchitectureFeedback />}
          </div>
        </div>
      </div>
    </div>
  );
}
