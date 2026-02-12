import { ReviewQuestion, ReviewValidationResult } from '@/types';

export function validateReviewQuestion(
  question: ReviewQuestion,
  selectedIssueIds: string[],
  issueSeverities: Record<string, string>
): ReviewValidationResult {
  let totalScore = 0;
  const maxScore = question.issues.reduce((sum, i) => sum + i.points, 0);

  const issueResults = question.issues.map((issue) => {
    const wasSelected = selectedIssueIds.includes(issue.id);
    const selectedSeverity = issueSeverities[issue.id] ?? null;
    const markedOk = selectedSeverity === 'ok';

    let points = 0;

    if (issue.isReal) {
      if (wasSelected && !markedOk) {
        // Correctly flagged a real issue
        points = issue.points;
        if (selectedSeverity === issue.severity) {
          points = Math.round(points * 1.2); // 20% bonus for correct severity
        }
      }
      // Missed (not selected or marked OK) = 0 points
    } else {
      if (!wasSelected || markedOk) {
        // Correctly identified as not an issue
        points = issue.points;
      } else {
        // False positive - flagged a non-issue
        points = -1;
      }
    }

    totalScore += points;

    return {
      id: issue.id,
      text: issue.text,
      wasSelected,
      selectedSeverity,
      isReal: issue.isReal,
      correctSeverity: issue.severity,
      points,
      explanation: issue.explanation,
    };
  });

  return {
    passed: totalScore > maxScore * 0.6,
    totalScore: Math.max(0, totalScore),
    maxScore,
    issueResults,
  };
}
