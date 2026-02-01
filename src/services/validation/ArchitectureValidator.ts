import {
  ConstraintsQuestion,
  ArchitectureValidationResult,
} from '@/types';

const POINTS = {
  crucial: 10,
  helpful: 5,
  irrelevant: -5,
} as const;

export function validateArchitectureQuestion(
  question: ConstraintsQuestion,
  selectedQuestionIds: string[],
  selectedArchitectureId: string
): ArchitectureValidationResult {
  const selectedQuestions = question.clarifyingQuestions.filter((q) =>
    selectedQuestionIds.includes(q.id)
  );

  // Calculate question scores
  const questionScores = selectedQuestions.map((q) => ({
    questionId: q.id,
    questionText: q.text,
    category: q.category,
    points: POINTS[q.category],
  }));

  const totalScore = questionScores.reduce((sum, qs) => sum + qs.points, 0);

  // Collect revealed constraints
  const revealedConstraints = selectedQuestions
    .filter((q) => q.reveals)
    .map((q) => q.reveals!);

  // Find missed crucial questions
  const missedCrucialQuestions = question.clarifyingQuestions.filter(
    (q) => q.category === 'crucial' && !selectedQuestionIds.includes(q.id)
  );

  // Find irrelevant questions that were selected
  const irrelevantQuestionsSelected = selectedQuestions.filter(
    (q) => q.category === 'irrelevant'
  );

  // Validate architecture choice
  const selectedArchitecture = question.architectureOptions.find(
    (opt) => opt.id === selectedArchitectureId
  );

  let architectureCorrect = false;
  let architectureFeedback = '';

  if (!selectedArchitecture) {
    architectureFeedback = 'No architecture selected.';
  } else {
    // Check if the selected architecture is valid given the revealed constraints
    const meetsAllConditions = selectedArchitecture.valid_when.every((condition) =>
      revealedConstraints.some(
        (rc) => rc.constraint === condition.constraint && rc.value === condition.value
      )
    );

    if (meetsAllConditions && selectedArchitecture.valid_when.length > 0) {
      architectureCorrect = true;
      architectureFeedback = `Correct! ${selectedArchitecture.name} is the right choice given the constraints you discovered.`;
    } else if (selectedArchitecture.valid_when.length === 0) {
      // Architecture with no conditions - check if it's the "safe default"
      architectureCorrect = revealedConstraints.length === 0;
      if (architectureCorrect) {
        architectureFeedback = `${selectedArchitecture.name} is a reasonable default when no specific constraints are known.`;
      } else {
        architectureFeedback = selectedArchitecture.feedback_if_wrong;
      }
    } else {
      architectureFeedback = selectedArchitecture.feedback_if_wrong;
    }
  }

  // Determine if passed: positive score and correct architecture
  const passed = totalScore > 0 && architectureCorrect;

  return {
    passed,
    totalScore,
    questionScores,
    revealedConstraints,
    architectureCorrect,
    architectureFeedback,
    missedCrucialQuestions,
    irrelevantQuestionsSelected,
  };
}
