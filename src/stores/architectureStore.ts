import { create } from 'zustand';
import { ArchitectureValidationResult } from '@/types';

export type ArchitecturePhase = 'questions' | 'architecture' | 'feedback';

interface ArchitectureState {
  // Current phase
  phase: ArchitecturePhase;

  // Selected clarifying question IDs
  selectedQuestionIds: string[];

  // Selected architecture option ID
  selectedArchitectureId: string | null;

  // Validation result after submission
  validationResult: ArchitectureValidationResult | null;

  // Actions
  setPhase: (phase: ArchitecturePhase) => void;
  toggleQuestion: (questionId: string, maxQuestions: number) => void;
  selectArchitecture: (architectureId: string) => void;
  setValidationResult: (result: ArchitectureValidationResult) => void;
  reset: () => void;
}

export const useArchitectureStore = create<ArchitectureState>((set, get) => ({
  phase: 'questions',
  selectedQuestionIds: [],
  selectedArchitectureId: null,
  validationResult: null,

  setPhase: (phase) => set({ phase }),

  toggleQuestion: (questionId, maxQuestions) => {
    const { selectedQuestionIds } = get();
    if (selectedQuestionIds.includes(questionId)) {
      // Remove the question
      set({
        selectedQuestionIds: selectedQuestionIds.filter((id) => id !== questionId),
      });
    } else if (selectedQuestionIds.length < maxQuestions) {
      // Add the question (only if under limit)
      set({
        selectedQuestionIds: [...selectedQuestionIds, questionId],
      });
    }
  },

  selectArchitecture: (architectureId) => set({ selectedArchitectureId: architectureId }),

  setValidationResult: (result) => set({ validationResult: result }),

  reset: () =>
    set({
      phase: 'questions',
      selectedQuestionIds: [],
      selectedArchitectureId: null,
      validationResult: null,
    }),
}));
