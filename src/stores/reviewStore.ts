import { create } from 'zustand';
import { ReviewValidationResult } from '@/types';

interface ReviewState {
  selectedIssueIds: string[];
  issueSeverities: Record<string, string>;
  validationResult: ReviewValidationResult | null;
  isSubmitted: boolean;

  toggleIssue: (issueId: string) => void;
  setSeverity: (issueId: string, severity: string) => void;
  setValidationResult: (result: ReviewValidationResult) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  selectedIssueIds: [],
  issueSeverities: {},
  validationResult: null,
  isSubmitted: false,

  toggleIssue: (issueId) =>
    set((state) => {
      if (state.isSubmitted) return state;
      const isSelected = state.selectedIssueIds.includes(issueId);
      if (isSelected) {
        const { [issueId]: _, ...rest } = state.issueSeverities;
        return {
          selectedIssueIds: state.selectedIssueIds.filter((id) => id !== issueId),
          issueSeverities: rest,
        };
      }
      return {
        selectedIssueIds: [...state.selectedIssueIds, issueId],
        issueSeverities: { ...state.issueSeverities, [issueId]: 'bug' },
      };
    }),

  setSeverity: (issueId, severity) =>
    set((state) => {
      if (state.isSubmitted) return state;
      const isSelected = state.selectedIssueIds.includes(issueId);
      const currentSeverity = state.issueSeverities[issueId];

      // Clicking the same severity again deselects the issue
      if (isSelected && currentSeverity === severity) {
        const { [issueId]: _, ...rest } = state.issueSeverities;
        return {
          selectedIssueIds: state.selectedIssueIds.filter((id) => id !== issueId),
          issueSeverities: rest,
        };
      }

      // Select the issue and set severity
      return {
        selectedIssueIds: isSelected ? state.selectedIssueIds : [...state.selectedIssueIds, issueId],
        issueSeverities: { ...state.issueSeverities, [issueId]: severity },
      };
    }),

  setValidationResult: (result) =>
    set({ validationResult: result, isSubmitted: true }),

  reset: () =>
    set({
      selectedIssueIds: [],
      issueSeverities: {},
      validationResult: null,
      isSubmitted: false,
    }),
}));
