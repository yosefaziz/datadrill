import { create } from 'zustand';
import { Question, QuestionMeta } from '@/types';

// Track the latest request to prevent race conditions
let latestQuestionRequestId = 0;

interface QuestionState {
  questions: QuestionMeta[];
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    difficulty: string | null;
    tag: string | null;
  };
  fetchQuestions: () => Promise<void>;
  fetchQuestion: (id: string) => Promise<void>;
  setDifficultyFilter: (difficulty: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  getFilteredQuestions: () => QuestionMeta[];
  getAllTags: () => string[];
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  currentQuestion: null,
  isLoading: false,
  error: null,
  filters: {
    difficulty: null,
    tag: null,
  },

  fetchQuestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/questions/index.json');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const questions = await response.json();
      set({ questions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load questions',
        isLoading: false,
      });
    }
  },

  fetchQuestion: async (id: string) => {
    const requestId = ++latestQuestionRequestId;
    set({ isLoading: true, error: null, currentQuestion: null });
    try {
      const response = await fetch(`/questions/${id}.json`);
      if (!response.ok) throw new Error('Failed to fetch question');
      const question = await response.json();
      // Only update state if this is still the latest request
      if (requestId === latestQuestionRequestId) {
        set({ currentQuestion: question, isLoading: false });
      }
    } catch (error) {
      // Only update error state if this is still the latest request
      if (requestId === latestQuestionRequestId) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load question',
          isLoading: false,
        });
      }
    }
  },

  setDifficultyFilter: (difficulty) => {
    set((state) => ({
      filters: { ...state.filters, difficulty },
    }));
  },

  setTagFilter: (tag) => {
    set((state) => ({
      filters: { ...state.filters, tag },
    }));
  },

  getFilteredQuestions: () => {
    const { questions, filters } = get();
    return questions.filter((q) => {
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
      if (filters.tag && !q.tags.includes(filters.tag)) return false;
      return true;
    });
  },

  getAllTags: () => {
    const { questions } = get();
    const tags = new Set<string>();
    questions.forEach((q) => q.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  },
}));
