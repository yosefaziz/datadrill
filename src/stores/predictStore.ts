import { create } from 'zustand';
import { PredictValidationResult } from '@/types';

interface PredictState {
  predictedRows: string[][];
  validationResult: PredictValidationResult | null;
  isSubmitted: boolean;

  initializeGrid: (rows: number, cols: number, givenColumns?: number[], expectedRows?: string[][]) => void;
  setCellValue: (row: number, col: number, value: string) => void;
  setValidationResult: (result: PredictValidationResult) => void;
  clearValidation: () => void;
  reset: () => void;
}

export const usePredictStore = create<PredictState>((set) => ({
  predictedRows: [],
  validationResult: null,
  isSubmitted: false,

  initializeGrid: (rows, cols, givenColumns, expectedRows) =>
    set((state) => {
      if (state.predictedRows.length === rows && state.predictedRows[0]?.length === cols) return state;
      return {
        predictedRows: Array.from({ length: rows }, (_, rowIdx) =>
          Array.from({ length: cols }, (_, colIdx) =>
            givenColumns?.includes(colIdx) && expectedRows?.[rowIdx]?.[colIdx]
              ? expectedRows[rowIdx][colIdx]
              : ''
          )
        ),
      };
    }),

  setCellValue: (row, col, value) =>
    set((state) => {
      if (state.isSubmitted) return state;
      const newRows = state.predictedRows.map((r) => [...r]);
      if (newRows[row]) {
        newRows[row][col] = value;
      }
      return { predictedRows: newRows };
    }),

  setValidationResult: (result) =>
    set({ validationResult: result, isSubmitted: true }),

  clearValidation: () =>
    set({ validationResult: null, isSubmitted: false }),

  reset: () =>
    set({
      predictedRows: [],
      validationResult: null,
      isSubmitted: false,
    }),
}));
