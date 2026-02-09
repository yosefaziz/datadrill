import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Discussion } from '@/types';

interface DiscussionState {
  discussions: Discussion[];
  isLoading: boolean;
  isPosting: boolean;

  fetchDiscussions: (questionId: string) => Promise<void>;
  postDiscussion: (questionId: string, content: string) => Promise<void>;
}

export const useDiscussionStore = create<DiscussionState>((set) => ({
  discussions: [],
  isLoading: false,
  isPosting: false,

  fetchDiscussions: async (questionId: string) => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('discussions')
      .select('*, profiles(display_name)')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch discussions:', error);
      set({ isLoading: false });
      return;
    }

    set({
      discussions: (data || []) as Discussion[],
      isLoading: false,
    });
  },

  postDiscussion: async (questionId: string, content: string) => {
    if (!isSupabaseConfigured) return;
    set({ isPosting: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isPosting: false });
      return;
    }

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        user_id: user.id,
        question_id: questionId,
        content,
      })
      .select('*, profiles(display_name)')
      .single();

    set({ isPosting: false });

    if (error) {
      console.error('Failed to post discussion:', error);
      throw error;
    }

    if (data) {
      set((state) => ({
        discussions: [data as Discussion, ...state.discussions],
      }));
    }
  },
}));
