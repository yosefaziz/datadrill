import { create } from 'zustand';
import { CanvasValidationResult } from '@/types';

interface CanvasState {
  // Map of stepId -> componentId
  selections: Record<string, string>;

  // Validation result after submission
  validationResult: CanvasValidationResult | null;

  // Whether the canvas has been submitted
  isSubmitted: boolean;

  // Actions
  selectComponent: (stepId: string, componentId: string) => void;
  clearSelection: (stepId: string) => void;
  setValidationResult: (result: CanvasValidationResult) => void;
  submit: () => void;
  reset: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  selections: {},
  validationResult: null,
  isSubmitted: false,

  selectComponent: (stepId, componentId) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [stepId]: componentId,
      },
    })),

  clearSelection: (stepId) =>
    set((state) => {
      const newSelections = { ...state.selections };
      delete newSelections[stepId];
      return { selections: newSelections };
    }),

  setValidationResult: (result) =>
    set({ validationResult: result, isSubmitted: true }),

  submit: () => set({ isSubmitted: true }),

  reset: () =>
    set({
      selections: {},
      validationResult: null,
      isSubmitted: false,
    }),
}));
