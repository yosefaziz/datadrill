import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ReportCategory, ReportStatus, AdminReport } from '@/types';

const ADMIN_PAGE_SIZE = 20;

interface AdminFilters {
  category: ReportCategory | null;
  showDismissed: boolean;
  showResolved: boolean;
}

interface ReportState {
  isSubmitting: boolean;

  // Admin state
  adminReports: AdminReport[];
  adminHasMore: boolean;
  adminIsLoading: boolean;
  adminFilters: AdminFilters;
  adminTotalCount: number;

  submitReport: (
    questionId: string,
    userId: string,
    category: ReportCategory,
    details: string | null,
  ) => Promise<void>;

  // Admin actions
  fetchAdminReports: (reset?: boolean) => Promise<void>;
  setAdminFilter: (key: keyof AdminFilters, value: ReportCategory | boolean | null) => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  isSubmitting: false,

  adminReports: [],
  adminHasMore: true,
  adminIsLoading: false,
  adminFilters: { category: null, showDismissed: false, showResolved: false },
  adminTotalCount: 0,

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
      .insert({
        user_id: userId,
        question_id: questionId,
        category,
        details,
      });

    set({ isSubmitting: false });

    if (error) {
      console.error('Failed to submit report:', error);
      throw error;
    }
  },

  fetchAdminReports: async (reset = false) => {
    if (!isSupabaseConfigured) {
      set({ adminIsLoading: false });
      return;
    }

    const state = get();
    if (state.adminIsLoading && !reset) return;

    if (state.adminReports.length === 0) {
      set({ adminIsLoading: true });
    }

    const offset = reset ? 0 : state.adminReports.length;

    try {
      let query = supabase
        .from('question_reports')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + ADMIN_PAGE_SIZE - 1);

      if (state.adminFilters.category) {
        query = query.eq('category', state.adminFilters.category);
      }

      if (!state.adminFilters.showDismissed) {
        query = query.neq('status', 'dismissed');
      }
      if (!state.adminFilters.showResolved) {
        query = query.neq('status', 'resolved');
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch display names for unique user IDs
      const reports = (data || []) as Omit<AdminReport, 'profiles'>[];
      const userIds = [...new Set(reports.map((r) => r.user_id))];

      let profileMap: Record<string, string | null> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.display_name]));
        }
      }

      const enrichedReports: AdminReport[] = reports.map((r) => ({
        ...r,
        profiles: { display_name: profileMap[r.user_id] ?? null },
      }));

      set({
        adminReports: reset ? enrichedReports : [...state.adminReports, ...enrichedReports],
        adminHasMore: enrichedReports.length === ADMIN_PAGE_SIZE,
        adminIsLoading: false,
        adminTotalCount: count ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch admin reports:', error);
      set({ adminIsLoading: false });
    }
  },

  setAdminFilter: (key, value) => {
    set((state) => ({
      adminFilters: { ...state.adminFilters, [key]: value },
      adminReports: [],
      adminHasMore: true,
    }));
  },

  updateReportStatus: async (reportId: string, status: ReportStatus) => {
    if (!isSupabaseConfigured) return;

    // Optimistic update
    set((state) => ({
      adminReports: state.adminReports.map((r) =>
        r.id === reportId ? { ...r, status } : r,
      ),
    }));

    const { data, error } = await supabase
      .from('question_reports')
      .update({ status })
      .eq('id', reportId)
      .select('id');

    if (error || !data || data.length === 0) {
      console.error('Failed to update report status:', error ?? 'No rows affected - check RLS policies');
      // Revert on failure
      get().fetchAdminReports(true);
    }
  },
}));
