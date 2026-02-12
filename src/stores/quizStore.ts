import { create } from 'zustand';
import { QuizValidationResult } from '@/types';

interface QuizState {
  selectedAnswers: string[];
  validationResult: QuizValidationResult | null;
  isSubmitted: boolean;
  shuffleKey: number;

  toggleAnswer: (answerId: string, multiSelect: boolean) => void;
  setValidationResult: (result: QuizValidationResult) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  selectedAnswers: [],
  validationResult: null,
  isSubmitted: false,
  shuffleKey: 0,

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
    set((state) => ({
      selectedAnswers: [],
      validationResult: null,
      isSubmitted: false,
      shuffleKey: state.shuffleKey + 1,
    })),
}));
