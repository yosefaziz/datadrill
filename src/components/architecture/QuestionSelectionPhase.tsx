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
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Phase 1: Ask Clarifying Questions
        </h2>
        <p className="text-text-secondary">
          Before choosing an architecture, gather requirements by asking the right questions.
          Select exactly {question.maxQuestions} questions.
        </p>
        {remainingSelections > 0 && (
          <p className="text-sm text-warning mt-2">
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
                  ? 'border-primary bg-primary/10'
                  : isDisabled
                    ? 'border-border bg-bg-secondary opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary hover:bg-bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
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
                <span className="text-text-primary">{cq.text}</span>
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
              ? 'bg-primary text-white hover:bg-primary-hover'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue to Architecture Selection
        </button>
      </div>
    </div>
  );
}
