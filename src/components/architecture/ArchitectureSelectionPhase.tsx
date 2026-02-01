import { ArchitectureQuestion } from '@/types';
import { useArchitectureStore } from '@/stores/architectureStore';
import { validateArchitectureQuestion } from '@/services/validation/ArchitectureValidator';

interface ArchitectureSelectionPhaseProps {
  question: ArchitectureQuestion;
}

export function ArchitectureSelectionPhase({ question }: ArchitectureSelectionPhaseProps) {
  const {
    selectedQuestionIds,
    selectedArchitectureId,
    selectArchitecture,
    setPhase,
    setValidationResult,
  } = useArchitectureStore();

  // Get the revealed constraints from selected questions
  const revealedConstraints = question.clarifyingQuestions
    .filter((q) => selectedQuestionIds.includes(q.id) && q.reveals)
    .map((q) => q.reveals!);

  const handleSubmit = () => {
    if (!selectedArchitectureId) return;

    const result = validateArchitectureQuestion(
      question,
      selectedQuestionIds,
      selectedArchitectureId
    );
    setValidationResult(result);
    setPhase('feedback');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Phase 2: Choose an Architecture
        </h2>
        <p className="text-slate-600">
          Based on the constraints you discovered, select the most appropriate architecture.
        </p>
      </div>

      {revealedConstraints.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Discovered Constraints:</h3>
          <ul className="space-y-1">
            {revealedConstraints.map((rc, idx) => (
              <li key={idx} className="text-green-700 flex items-center gap-2">
                <span className="text-green-500">•</span>
                <span className="font-medium capitalize">{rc.constraint}:</span>
                <span>{rc.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {question.architectureOptions.map((opt) => {
          const isSelected = selectedArchitectureId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => selectArchitecture(opt.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-800">{opt.name}</div>
                  <div className="text-sm text-slate-600 mt-1">{opt.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setPhase('questions')}
          className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          Back to Questions
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedArchitectureId}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedArchitectureId
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}
