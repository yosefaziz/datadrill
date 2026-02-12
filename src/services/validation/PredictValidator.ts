import { PredictQuestion, PredictValidationResult } from '@/types';

export function validatePredictQuestion(
  question: PredictQuestion,
  predictedRows: string[][]
): PredictValidationResult {
  const givenCols = question.givenColumns ?? [];
  const scorableCols = question.expectedColumns
    .map((_, i) => i)
    .filter((i) => !givenCols.includes(i));

  // Build normalized expected rows (only scorable columns)
  const normalizedExpected = question.expectedRows.map((row) =>
    scorableCols.map((col) => (row[col] ?? '').trim().toLowerCase())
  );

  // Build normalized predicted rows (only scorable columns)
  const normalizedPredicted = predictedRows.map((row) =>
    scorableCols.map((col) => (row[col] ?? '').trim().toLowerCase())
  );

  // Match each predicted row to the best expected row (order-independent)
  const usedExpected = new Set<number>();
  const rowMapping: (number | null)[] = normalizedPredicted.map((predRow) => {
    for (let e = 0; e < normalizedExpected.length; e++) {
      if (usedExpected.has(e)) continue;
      const expRow = normalizedExpected[e];
      if (predRow.length === expRow.length && predRow.every((val, i) => val === expRow[i])) {
        usedExpected.add(e);
        return e;
      }
    }
    return null;
  });

  // Score cells using the matched rows
  const cellResults: PredictValidationResult['cellResults'] = [];
  let correctCells = 0;
  let totalCells = 0;

  for (let row = 0; row < question.expectedRows.length; row++) {
    const matchedExpIdx = rowMapping[row];
    for (const col of scorableCols) {
      const actual = (predictedRows[row]?.[col] ?? '').trim().toLowerCase();
      const expectedRow = matchedExpIdx !== null ? question.expectedRows[matchedExpIdx] : null;
      const expected = expectedRow ? (expectedRow[col] ?? '').trim().toLowerCase() : '';
      const correct = matchedExpIdx !== null && actual === expected;
      if (correct) correctCells++;
      totalCells++;
      cellResults.push({
        row,
        col,
        expected: expectedRow?.[col] ?? '?',
        actual: predictedRows[row]?.[col] ?? '',
        correct,
      });
    }
  }

  return {
    passed: correctCells === totalCells && totalCells > 0,
    totalCells,
    correctCells,
    cellResults,
  };
}
