import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ReactionType } from '@/types';

interface ReactionCounts {
  likes: number;
  dislikes: number;
}

interface ReactionState {
  reactions: Record<string, ReactionCounts>;
  userReactions: Record<string, ReactionType>;
  isLoading: boolean;

  fetchReactions: (questionId: string) => Promise<void>;
  toggleReaction: (questionId: string, reaction: ReactionType) => Promise<void>;
}

export const useReactionStore = create<ReactionState>((set, get) => ({
  reactions: {},
  userReactions: {},
  isLoading: false,

  fetchReactions: async (questionId: string) => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true });

    // Fetch all reactions for this question to compute counts
    const { data, error } = await supabase
      .from('question_reactions')
      .select('reaction, user_id')
      .eq('question_id', questionId);

    if (error) {
      console.error('Failed to fetch reactions:', error);
      set({ isLoading: false });
      return;
    }

    const rows = data || [];
    let likes = 0;
    let dislikes = 0;
    for (const row of rows) {
      if (row.reaction === 'like') likes++;
      else if (row.reaction === 'dislike') dislikes++;
    }

    // Check user's own reaction
    const { data: { user } } = await supabase.auth.getUser();
    const userReaction = user
      ? rows.find((r) => r.user_id === user.id)
      : undefined;

    set((state) => ({
      reactions: { ...state.reactions, [questionId]: { likes, dislikes } },
      userReactions: userReaction
        ? { ...state.userReactions, [questionId]: userReaction.reaction as ReactionType }
        : (() => {
            const next = { ...state.userReactions };
            delete next[questionId];
            return next;
          })(),
      isLoading: false,
    }));
  },

  toggleReaction: async (questionId: string, reaction: ReactionType) => {
    if (!isSupabaseConfigured) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentReaction = get().userReactions[questionId];
    const currentCounts = get().reactions[questionId] || { likes: 0, dislikes: 0 };

    // Optimistic update
    if (currentReaction === reaction) {
      // Toggle off: remove reaction
      const newCounts = { ...currentCounts };
      if (reaction === 'like') newCounts.likes = Math.max(0, newCounts.likes - 1);
      else newCounts.dislikes = Math.max(0, newCounts.dislikes - 1);

      set((state) => {
        const newUserReactions = { ...state.userReactions };
        delete newUserReactions[questionId];
        return {
          reactions: { ...state.reactions, [questionId]: newCounts },
          userReactions: newUserReactions,
        };
      });
    } else {
      // Set or switch reaction
      const newCounts = { ...currentCounts };
      if (reaction === 'like') {
        newCounts.likes++;
        if (currentReaction === 'dislike') newCounts.dislikes = Math.max(0, newCounts.dislikes - 1);
      } else {
        newCounts.dislikes++;
        if (currentReaction === 'like') newCounts.likes = Math.max(0, newCounts.likes - 1);
      }

      set((state) => ({
        reactions: { ...state.reactions, [questionId]: newCounts },
        userReactions: { ...state.userReactions, [questionId]: reaction },
      }));
    }

    // Persist to Supabase
    if (currentReaction === reaction) {
      // Remove reaction
      const { error } = await supabase
        .from('question_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) {
        console.error('Failed to remove reaction:', error);
        get().fetchReactions(questionId);
      }
    } else {
      // Upsert reaction
      const { error } = await supabase
        .from('question_reactions')
        .upsert(
          {
            user_id: user.id,
            question_id: questionId,
            reaction,
          },
          { onConflict: 'user_id,question_id' },
        );

      if (error) {
        console.error('Failed to save reaction:', error);
        get().fetchReactions(questionId);
      }
    }
  },
}));
