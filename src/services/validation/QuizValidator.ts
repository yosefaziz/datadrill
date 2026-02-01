import { QuizQuestion, QuizValidationResult } from '@/types';

export function validateQuizQuestion(
  question: QuizQuestion,
  selectedAnswers: string[]
): QuizValidationResult {
  const correctAnswerIds = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => a.id);

  // Check if all correct answers are selected and no incorrect answers are selected
  const allCorrectSelected = correctAnswerIds.every((id) =>
    selectedAnswers.includes(id)
  );
  const noIncorrectSelected = selectedAnswers.every((id) =>
    correctAnswerIds.includes(id)
  );
  const passed = allCorrectSelected && noIncorrectSelected;

  const answerResults = question.answers.map((answer) => ({
    answerId: answer.id,
    answerText: answer.text,
    wasSelected: selectedAnswers.includes(answer.id),
    isCorrect: answer.isCorrect,
    explanation: answer.explanation,
  }));

  return {
    passed,
    selectedAnswers,
    correctAnswers: correctAnswerIds,
    answerResults,
    overallExplanation: question.explanation,
  };
}
