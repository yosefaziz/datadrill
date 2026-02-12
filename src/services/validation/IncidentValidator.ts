import { IncidentQuestion, IncidentValidationResult } from '@/types';

export function validateIncidentQuestion(
  question: IncidentQuestion,
  revealedStepIds: string[],
  selectedRootCauseId: string,
  selectedFixIds: string[]
): IncidentValidationResult {
  // Investigation efficiency
  const stepsRevealed = revealedStepIds.map((id) => {
    const step = question.investigationSteps.find((s) => s.id === id);
    return { id, action: step?.action ?? '', category: step?.category ?? 'irrelevant' };
  });

  const essentialSteps = question.investigationSteps.filter((s) => s.category === 'essential');
  const essentialFound = revealedStepIds.filter((id) =>
    essentialSteps.some((s) => s.id === id)
  ).length;
  const investigationEfficiency = revealedStepIds.length > 0
    ? essentialFound / revealedStepIds.length
    : 0;

  // Root cause
  const selectedRootCause = question.rootCauses.find((rc) => rc.id === selectedRootCauseId);
  const rootCauseCorrect = selectedRootCause?.correct ?? false;
  const rootCauseFeedback = selectedRootCause?.feedback ?? 'No root cause selected.';

  // Fixes
  let fixScore = 0;
  const maxFixScore = question.fixes
    .filter((f) => f.correct)
    .reduce((sum, f) => sum + f.points, 0);

  const fixResults = question.fixes.map((f) => {
    const selected = selectedFixIds.includes(f.id);
    const points = selected ? (f.correct ? f.points : -1) : 0;
    fixScore += points;
    return { id: f.id, text: f.text, selected, correct: f.correct, points, feedback: f.feedback };
  });

  return {
    passed: rootCauseCorrect && fixScore > 0,
    investigationEfficiency,
    stepsRevealed,
    rootCauseCorrect,
    rootCauseFeedback,
    fixScore: Math.max(0, fixScore),
    maxFixScore,
    fixResults,
  };
}
