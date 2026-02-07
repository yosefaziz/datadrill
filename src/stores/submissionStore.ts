import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Submission, SubmissionInsert } from '@/types';

const ANON_ATTEMPTS_KEY = 'datadrill-anon-attempts';
const PAGE_SIZE = 20;

interface SubmissionFilters {
  skill: string | null;
  passed: boolean | null;
}

interface SubmissionState {
  // History list
  submissions: Submission[];
  hasMore: boolean;
  isLoadingHistory: boolean;
  filters: SubmissionFilters;

  // Per-question
  questionSubmissions: Submission[];
  isLoadingQuestion: boolean;

  // Actions
  submitAnswer: (insert: SubmissionInsert, userId: string | null) => Promise<void>;
  fetchHistory: (userId: string, reset?: boolean) => Promise<void>;
  fetchQuestionSubmissions: (userId: string, questionId: string) => Promise<void>;
  setFilter: (key: keyof SubmissionFilters, value: string | boolean | null) => void;
  clearHistory: () => void;

  // Anonymous gating
  canSubmit: (questionId: string, isAuthenticated: boolean) => boolean;
  incrementAnonAttempt: (questionId: string) => void;
  getAnonAttemptCount: (questionId: string) => number;
}

function getAnonAttempts(): Record<string, number> {
  try {
    const data = localStorage.getItem(ANON_ATTEMPTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setAnonAttempts(attempts: Record<string, number>) {
  localStorage.setItem(ANON_ATTEMPTS_KEY, JSON.stringify(attempts));
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  hasMore: true,
  isLoadingHistory: false,
  filters: { skill: null, passed: null },
  questionSubmissions: [],
  isLoadingQuestion: false,

  submitAnswer: async (insert: SubmissionInsert, userId: string | null) => {
    if (!userId) {
      // Anonymous: just increment localStorage counter
      get().incrementAnonAttempt(insert.question_id);
      return;
    }

    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('submissions').insert({
      user_id: userId,
      ...insert,
    });

    if (error) {
      console.error('Failed to save submission:', error);
      throw error;
    }
  },

  fetchHistory: async (userId: string, reset = false) => {
    if (!isSupabaseConfigured) {
      set({ isLoadingHistory: false });
      return;
    }
    const state = get();
    if (state.isLoadingHistory && !reset) return;

    // Only show loading spinner on first fetch, not background refreshes
    if (state.submissions.length === 0) {
      set({ isLoadingHistory: true });
    }

    const offset = reset ? 0 : state.submissions.length;

    try {
      let query = supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (state.filters.skill) {
        query = query.eq('skill', state.filters.skill);
      }
      if (state.filters.passed !== null) {
        query = query.eq('passed', state.filters.passed);
      }

      const { data, error } = await query;

      if (error) throw error;

      const newSubmissions = (data || []) as Submission[];
      set({
        submissions: reset ? newSubmissions : [...state.submissions, ...newSubmissions],
        hasMore: newSubmissions.length === PAGE_SIZE,
        isLoadingHistory: false,
      });
    } catch (error) {
      console.error('Failed to fetch history:', error);
      set({ isLoadingHistory: false });
    }
  },

  fetchQuestionSubmissions: async (userId: string, questionId: string) => {
    if (!isSupabaseConfigured) return;
    set({ isLoadingQuestion: true });

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Failed to fetch question submissions:', error);
      set({ isLoadingQuestion: false });
      return;
    }

    set({
      questionSubmissions: (data || []) as Submission[],
      isLoadingQuestion: false,
    });
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      submissions: [],
      hasMore: true,
    }));
  },

  clearHistory: () => {
    set({ submissions: [], hasMore: true, questionSubmissions: [] });
  },

  canSubmit: (questionId: string, isAuthenticated: boolean) => {
    if (isAuthenticated) return true;
    return get().getAnonAttemptCount(questionId) < 2;
  },

  incrementAnonAttempt: (questionId: string) => {
    const attempts = getAnonAttempts();
    attempts[questionId] = (attempts[questionId] || 0) + 1;
    setAnonAttempts(attempts);
  },

  getAnonAttemptCount: (questionId: string) => {
    return getAnonAttempts()[questionId] || 0;
  },
}));
