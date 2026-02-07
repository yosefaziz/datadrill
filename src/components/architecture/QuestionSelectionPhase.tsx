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
    <div className="p-4 flex flex-col h-full">
      <div className="mb-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Phase 1: Ask Clarifying Questions
          </h2>
          {remainingSelections > 0 && (
            <span className="text-sm text-warning whitespace-nowrap">
              {remainingSelections} more to select
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Gather requirements by selecting {question.maxQuestions} questions.
        </p>
      </div>

      <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-2" role="group" aria-label="Select clarifying questions">
        {question.clarifyingQuestions.map((cq) => {
          const isSelected = selectedQuestionIds.includes(cq.id);
          const isDisabled = !isSelected && selectedQuestionIds.length >= question.maxQuestions;

          return (
            <button
              key={cq.id}
              onClick={() => toggleQuestion(cq.id, question.maxQuestions)}
              disabled={isDisabled}
              role="checkbox"
              aria-checked={isSelected}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : isDisabled
                    ? 'border-border bg-bg-secondary opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary hover:bg-bg-secondary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
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
                <span className="text-sm text-text-primary">{cq.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-3 border-t border-border shrink-0">
        <button
          onClick={() => setPhase('architecture')}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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
