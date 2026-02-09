import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ReportCategory } from '@/types';

interface ReportState {
  reportedQuestions: Set<string>;
  isSubmitting: boolean;

  checkReport: (questionId: string, userId: string) => Promise<void>;
  submitReport: (
    questionId: string,
    userId: string,
    category: ReportCategory,
    details: string | null,
  ) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  reportedQuestions: new Set(),
  isSubmitting: false,

  checkReport: async (questionId: string, userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('question_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (error) {
      console.error('Failed to check report:', error);
      return;
    }

    if (data) {
      set((state) => ({
        reportedQuestions: new Set([...state.reportedQuestions, questionId]),
      }));
    }
  },

  submitReport: async (
    questionId: string,
    userId: string,
    category: ReportCategory,
    details: string | null,
  ) => {
    if (!isSupabaseConfigured) return;
    set({ isSubmitting: true });

    const { error } = await supabase
      .from('question_reports')
      .upsert(
        {
          user_id: userId,
          question_id: questionId,
          category,
          details,
        },
        { onConflict: 'user_id,question_id' },
      );

    set({ isSubmitting: false });

    if (error) {
      console.error('Failed to submit report:', error);
      throw error;
    }

    set((state) => ({
      reportedQuestions: new Set([...state.reportedQuestions, questionId]),
    }));
  },
}));
