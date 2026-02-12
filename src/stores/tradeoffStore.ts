import { create } from 'zustand';
import { TradeoffValidationResult } from '@/types';

interface TradeoffState {
  selectedOptionId: string | null;
  selectedJustificationIds: string[];
  validationResult: TradeoffValidationResult | null;
  isSubmitted: boolean;

  selectOption: (optionId: string) => void;
  toggleJustification: (justificationId: string, maxJustifications: number) => void;
  setValidationResult: (result: TradeoffValidationResult) => void;
  reset: () => void;
}

export const useTradeoffStore = create<TradeoffState>((set) => ({
  selectedOptionId: null,
  selectedJustificationIds: [],
  validationResult: null,
  isSubmitted: false,

  selectOption: (optionId) =>
    set((state) => {
      if (state.isSubmitted) return state;
      return { selectedOptionId: optionId, selectedJustificationIds: [] };
    }),

  toggleJustification: (justificationId, maxJustifications) =>
    set((state) => {
      if (state.isSubmitted) return state;
      const isSelected = state.selectedJustificationIds.includes(justificationId);
      if (isSelected) {
        return {
          selectedJustificationIds: state.selectedJustificationIds.filter((id) => id !== justificationId),
        };
      }
      if (state.selectedJustificationIds.length >= maxJustifications) return state;
      return {
        selectedJustificationIds: [...state.selectedJustificationIds, justificationId],
      };
    }),

  setValidationResult: (result) =>
    set({ validationResult: result, isSubmitted: true }),

  reset: () =>
    set({
      selectedOptionId: null,
      selectedJustificationIds: [],
      validationResult: null,
      isSubmitted: false,
    }),
}));
