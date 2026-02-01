import { ConstraintsQuestion } from '@/types';
import { useArchitectureStore } from '@/stores/architectureStore';

interface QuestionSelectionPhaseProps {
  question: ConstraintsQuestion;
}

export function QuestionSelectionPhase({ question }: QuestionSelectionPhaseProps) {
  const { selectedQuestionIds, toggleQuestion, setPhase } = useArchitectureStore();

  const canProceed = selectedQuestionIds.length === question.maxQuestions;
  const remainingSelections = question.maxQuestions - selectedQuestionIds.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Phase 1: Ask Clarifying Questions
        </h2>
        <p className="text-slate-600">
          Before choosing an architecture, gather requirements by asking the right questions.
          Select exactly {question.maxQuestions} questions.
        </p>
        {remainingSelections > 0 && (
          <p className="text-sm text-amber-600 mt-2">
            Select {remainingSelections} more question{remainingSelections !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {question.clarifyingQuestions.map((cq) => {
          const isSelected = selectedQuestionIds.includes(cq.id);
          const isDisabled = !isSelected && selectedQuestionIds.length >= question.maxQuestions;

          return (
            <button
              key={cq.id}
              onClick={() => toggleQuestion(cq.id, question.maxQuestions)}
              disabled={isDisabled}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isDisabled
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-slate-700">{cq.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setPhase('architecture')}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue to Architecture Selection
        </button>
      </div>
    </div>
  );
}
