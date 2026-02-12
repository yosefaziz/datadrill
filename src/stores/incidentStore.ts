import { create } from 'zustand';
import { IncidentValidationResult } from '@/types';

type IncidentPhase = 'investigate' | 'diagnose' | 'fix' | 'result';

interface IncidentState {
  phase: IncidentPhase;
  revealedStepIds: string[];
  selectedRootCauseId: string | null;
  selectedFixIds: string[];
  validationResult: IncidentValidationResult | null;

  revealStep: (stepId: string, maxSteps: number) => void;
  advancePhase: () => void;
  selectRootCause: (rootCauseId: string) => void;
  toggleFix: (fixId: string, maxFixes: number) => void;
  setValidationResult: (result: IncidentValidationResult) => void;
  reset: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  phase: 'investigate',
  revealedStepIds: [],
  selectedRootCauseId: null,
  selectedFixIds: [],
  validationResult: null,

  revealStep: (stepId, maxSteps) =>
    set((state) => {
      if (state.phase !== 'investigate') return state;
      if (state.revealedStepIds.includes(stepId)) return state;
      if (state.revealedStepIds.length >= maxSteps) return state;
      return { revealedStepIds: [...state.revealedStepIds, stepId] };
    }),

  advancePhase: () =>
    set((state) => {
      const phases: IncidentPhase[] = ['investigate', 'diagnose', 'fix', 'result'];
      const idx = phases.indexOf(state.phase);
      if (idx < phases.length - 1) {
        return { phase: phases[idx + 1] };
      }
      return state;
    }),

  selectRootCause: (rootCauseId) =>
    set((state) => {
      if (state.phase !== 'diagnose') return state;
      return { selectedRootCauseId: rootCauseId };
    }),

  toggleFix: (fixId, maxFixes) =>
    set((state) => {
      if (state.phase !== 'fix') return state;
      const isSelected = state.selectedFixIds.includes(fixId);
      if (isSelected) {
        return { selectedFixIds: state.selectedFixIds.filter((id) => id !== fixId) };
      }
      if (state.selectedFixIds.length >= maxFixes) return state;
      return { selectedFixIds: [...state.selectedFixIds, fixId] };
    }),

  setValidationResult: (result) =>
    set({ validationResult: result, phase: 'result' }),

  reset: () =>
    set({
      phase: 'investigate',
      revealedStepIds: [],
      selectedRootCauseId: null,
      selectedFixIds: [],
      validationResult: null,
    }),
}));
