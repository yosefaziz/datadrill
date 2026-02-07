import { ConstraintsQuestion } from '@/types';
import { useArchitectureStore } from '@/stores/architectureStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { validateArchitectureQuestion } from '@/services/validation/ArchitectureValidator';

interface ArchitectureSelectionPhaseProps {
  question: ConstraintsQuestion;
}

export function ArchitectureSelectionPhase({ question }: ArchitectureSelectionPhaseProps) {
  const {
    selectedQuestionIds,
    selectedArchitectureId,
    selectArchitecture,
    setPhase,
    setValidationResult,
  } = useArchitectureStore();
  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);

  // Get the revealed constraints from selected questions
  const revealedConstraints = question.clarifyingQuestions
    .filter((q) => selectedQuestionIds.includes(q.id) && q.reveals)
    .map((q) => q.reveals!);

  const handleSubmit = async () => {
    if (!selectedArchitectureId) return;

    const result = validateArchitectureQuestion(
      question,
      selectedQuestionIds,
      selectedArchitectureId
    );
    setValidationResult(result);
    setPhase('feedback');

    try {
      await submitAnswer(
        {
          question_id: question.id,
          skill: 'architecture',
          difficulty: question.difficulty,
          answer: JSON.stringify({ selectedQuestionIds, selectedArchitectureId }),
          passed: result.passed,
          result_meta: result as unknown as Record<string, unknown>,
        },
        user?.id || null
      );
    } catch {
      // Non-critical
    }
  };

  return (
    <div className="p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Phase 2: Choose an Architecture
        </h2>
        <p className="text-text-secondary">
          Based on the constraints you discovered, select the most appropriate architecture.
        </p>
      </div>

      {revealedConstraints.length > 0 && (
        <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
          <h3 className="font-medium text-success mb-2">Discovered Constraints:</h3>
          <ul className="space-y-1">
            {revealedConstraints.map((rc, idx) => (
              <li key={idx} className="text-success flex items-center gap-2">
                <span className="text-success/70">•</span>
                <span className="font-medium capitalize">{rc.constraint}:</span>
                <span>{rc.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3 mb-6" role="radiogroup" aria-label="Select architecture">
        {question.architectureOptions.map((opt) => {
          const isSelected = selectedArchitectureId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => selectArchitecture(opt.id)}
              role="radio"
              aria-checked={isSelected}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary hover:bg-bg-secondary'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-text-primary">{opt.name}</div>
                  <div className="text-sm text-text-secondary mt-1">{opt.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setPhase('questions')}
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg"
        >
          Back to Questions
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedArchitectureId}
          className={`px-6 py-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            selectedArchitectureId
              ? 'bg-success text-white hover:bg-success'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}
