import { OptimizeQuestion, OptimizeValidationResult } from '@/types';

export function validateOptimizeQuestion(
  question: OptimizeQuestion,
  userCode: string
): OptimizeValidationResult {
  // Check anti-patterns via regex
  const antiPatternMatches: OptimizeValidationResult['antiPatternMatches'] = [];
  for (const ap of question.antiPatterns) {
    try {
      const regex = new RegExp(ap.pattern, 'i');
      if (regex.test(userCode)) {
        antiPatternMatches.push({ pattern: ap.pattern, message: ap.message });
      }
    } catch {
      // Invalid regex - skip
    }
  }

  // For tools skill (conceptual Spark questions), check that the code differs from the original
  // and has no anti-patterns. Full execution-based validation can be added later for SQL skill.
  const codeChanged = userCode.trim() !== question.slowQuery.trim();
  const noAntiPatterns = antiPatternMatches.length === 0;
  const passed = codeChanged && noAntiPatterns;

  let feedback = '';
  if (!codeChanged) {
    feedback = 'Your code is identical to the original slow query. Try applying optimizations.';
  } else if (!noAntiPatterns) {
    feedback = `Found ${antiPatternMatches.length} anti-pattern${antiPatternMatches.length > 1 ? 's' : ''} in your code.`;
  } else {
    feedback = 'Your optimized code avoids all known anti-patterns.';
  }

  return {
    passed,
    outputCorrect: codeChanged,
    antiPatternMatches,
    feedback,
  };
}
