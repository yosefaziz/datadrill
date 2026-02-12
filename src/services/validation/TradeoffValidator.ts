import { TradeoffQuestion, TradeoffValidationResult } from '@/types';

export function validateTradeoffQuestion(
  question: TradeoffQuestion,
  selectedOptionId: string,
  selectedJustificationIds: string[]
): TradeoffValidationResult {
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const optionCorrect = selectedOption?.correct ?? false;
  const optionFeedback = selectedOption?.feedback ?? 'No option selected.';

  let justificationScore = 0;
  let maxJustificationScore = 0;

  const justificationResults = question.justifications.map((j) => {
    const selected = selectedJustificationIds.includes(j.id);
    const isValidForSelected = j.validFor.includes(selectedOptionId);
    // Points are earned if selected AND valid for the chosen option
    const points = selected ? (isValidForSelected ? j.points : -Math.abs(j.points)) : 0;
    if (isValidForSelected && j.points > 0) maxJustificationScore += j.points;
    justificationScore += points;

    const feedback = selected
      ? isValidForSelected
        ? 'Good reasoning!'
        : 'This justification doesn\'t support your chosen option.'
      : isValidForSelected && j.points > 0
        ? 'You missed this relevant justification.'
        : '';

    return { id: j.id, text: j.text, selected, points, feedback };
  });

  return {
    passed: optionCorrect && justificationScore > 0,
    optionCorrect,
    optionFeedback,
    selectedOptionId,
    justificationScore: Math.max(0, justificationScore),
    maxJustificationScore,
    justificationResults,
  };
}
