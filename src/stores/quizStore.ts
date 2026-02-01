import { create } from 'zustand';
import { QuizValidationResult } from '@/types';

interface QuizState {
  selectedAnswers: string[];
  validationResult: QuizValidationResult | null;
  isSubmitted: boolean;

  toggleAnswer: (answerId: string, multiSelect: boolean) => void;
  setValidationResult: (result: QuizValidationResult) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  selectedAnswers: [],
  validationResult: null,
  isSubmitted: false,

  toggleAnswer: (answerId, multiSelect) =>
    set((state) => {
      if (state.isSubmitted) return state;

      if (multiSelect) {
        // Toggle the answer in multi-select mode
        const isSelected = state.selectedAnswers.includes(answerId);
        return {
          selectedAnswers: isSelected
            ? state.selectedAnswers.filter((id) => id !== answerId)
            : [...state.selectedAnswers, answerId],
        };
      } else {
        // Single select mode - replace selection
        return {
          selectedAnswers: [answerId],
        };
      }
    }),

  setValidationResult: (result) =>
    set({ validationResult: result, isSubmitted: true }),

  reset: () =>
    set({
      selectedAnswers: [],
      validationResult: null,
      isSubmitted: false,
    }),
}));
