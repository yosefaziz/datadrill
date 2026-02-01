import { CanvasQuestion, CanvasValidationResult, CanvasStepResult } from '@/types';

const POINTS = {
  correct: 10,
  partial: 5,
  wrong: 0,
  missing: 0,
} as const;

export function validateCanvasQuestion(
  question: CanvasQuestion,
  selections: Record<string, string>
): CanvasValidationResult {
  const stepResults: CanvasStepResult[] = [];
  let totalScore = 0;
  const maxScore = question.steps.length * POINTS.correct;

  for (const step of question.steps) {
    const selectedComponent = selections[step.id] || null;

    if (!selectedComponent) {
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        selectedComponent: null,
        status: 'missing',
        feedback: 'No component selected for this step.',
        points: POINTS.missing,
      });
      continue;
    }

    // Check if it's a valid choice
    const validChoice = step.validChoices.find(
      (c) => c.componentId === selectedComponent
    );
    if (validChoice) {
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        selectedComponent,
        status: 'correct',
        feedback: validChoice.feedback,
        points: POINTS.correct,
      });
      totalScore += POINTS.correct;
      continue;
    }

    // Check if it's a partial choice
    const partialChoice = step.partialChoices?.find(
      (c) => c.componentId === selectedComponent
    );
    if (partialChoice) {
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        selectedComponent,
        status: 'partial',
        feedback: partialChoice.feedback,
        points: POINTS.partial,
      });
      totalScore += POINTS.partial;
      continue;
    }

    // Check if it's an invalid choice
    const invalidChoice = step.invalidChoices.find(
      (c) => c.componentId === selectedComponent
    );
    if (invalidChoice) {
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        selectedComponent,
        status: 'wrong',
        feedback: invalidChoice.feedback,
        points: POINTS.wrong,
      });
      continue;
    }

    // Component not in any list - treat as wrong with generic feedback
    stepResults.push({
      stepId: step.id,
      stepName: step.name,
      selectedComponent,
      status: 'wrong',
      feedback: 'This component is not suitable for this step.',
      points: POINTS.wrong,
    });
  }

  // Passed if scored at least 70% of max score
  const passed = totalScore >= maxScore * 0.7;

  return {
    passed,
    totalScore,
    maxScore,
    stepResults,
  };
}
