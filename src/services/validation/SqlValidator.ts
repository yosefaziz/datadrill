import { IValidator } from './IValidator';
import { duckDBService } from '@/services/duckdb/DuckDBService';
import { Question, QueryResult, ValidationResult, isSqlQuestion, isDebugQuestion } from '@/types';

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'bigint') return value.toString();
  return String(value).trim().toLowerCase();
}

function normalizeColumns(columns: string[]): string[] {
  return columns.map((c) => c.toLowerCase().trim());
}

function sortRows(rows: unknown[][]): unknown[][] {
  return [...rows].sort((a, b) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const aVal = normalizeValue(a[i]);
      const bVal = normalizeValue(b[i]);
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

function reorderRowsByColumns(
  rows: unknown[][],
  columns: string[],
  targetOrder: string[]
): unknown[][] {
  const indexMap = columns.map((col) =>
    targetOrder.findIndex((target) => target === col)
  );

  return rows.map((row) => indexMap.map((newIndex) => row[newIndex]));
}

function compareResults(expected: QueryResult, actual: QueryResult): boolean {
  const expectedCols = normalizeColumns(expected.columns);
  const actualCols = normalizeColumns(actual.columns);

  if (expectedCols.length !== actualCols.length) return false;

  const expectedColsSorted = [...expectedCols].sort();
  const actualColsSorted = [...actualCols].sort();
  if (!expectedColsSorted.every((col, i) => col === actualColsSorted[i])) return false;

  if (expected.rows.length !== actual.rows.length) return false;

  const reorderedActualRows = reorderRowsByColumns(actual.rows, actualCols, expectedCols);

  const expectedRows = sortRows(expected.rows);
  const actualRows = sortRows(reorderedActualRows);

  for (let i = 0; i < expectedRows.length; i++) {
    const expectedRow = expectedRows[i];
    const actualRow = actualRows[i];

    if (expectedRow.length !== actualRow.length) return false;

    for (let j = 0; j < expectedRow.length; j++) {
      if (normalizeValue(expectedRow[j]) !== normalizeValue(actualRow[j])) {
        return false;
      }
    }
  }

  return true;
}

class SqlValidator implements IValidator {
  async validate(question: Question, userCode: string): Promise<ValidationResult> {
    // Only handle SQL questions or Debug questions with SQL language
    if (!isSqlQuestion(question) && !(isDebugQuestion(question) && question.language === 'sql')) {
      return {
        passed: false,
        totalDatasets: 0,
        passedDatasets: 0,
        error: 'SqlValidator can only validate SQL questions',
      };
    }

    const datasets = [
      question.tables.map((t) => ({ name: t.name, data: t.visibleData })),
      ...question.tables[0].hiddenDatasets.map((_, datasetIndex) =>
        question.tables.map((t) => ({
          name: t.name,
          data: t.hiddenDatasets[datasetIndex],
        }))
      ),
    ];

    let passedDatasets = 0;
    const totalDatasets = datasets.length;

    try {
      for (const dataset of datasets) {
        await duckDBService.dropAllTables();

        for (const table of dataset) {
          await duckDBService.createTable(table.name, table.data);
        }

        const userResult = await duckDBService.executeQuery(userCode);
        if (userResult.error) {
          return {
            passed: false,
            totalDatasets,
            passedDatasets,
            error: userResult.error,
          };
        }

        const expectedResult = await duckDBService.executeQuery(
          question.expectedOutputQuery
        );
        if (expectedResult.error) {
          return {
            passed: false,
            totalDatasets,
            passedDatasets,
            error: `Expected query error: ${expectedResult.error}`,
          };
        }

        if (compareResults(expectedResult, userResult)) {
          passedDatasets++;
        }
      }

      return {
        passed: passedDatasets === totalDatasets,
        totalDatasets,
        passedDatasets,
      };
    } catch (error) {
      return {
        passed: false,
        totalDatasets,
        passedDatasets,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const sqlValidator = new SqlValidator();
