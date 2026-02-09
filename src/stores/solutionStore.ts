import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Solution } from '@/types';

interface SolutionState {
  solutions: Solution[];
  userVotes: Record<string, 1 | -1>;
  isLoading: boolean;
  isPosting: boolean;

  fetchSolutions: (questionId: string) => Promise<void>;
  postSolution: (questionId: string, title: string, content: string, language: string) => Promise<void>;
  voteSolution: (solutionId: string, vote: 1 | -1) => Promise<void>;
}

export const useSolutionStore = create<SolutionState>((set, get) => ({
  solutions: [],
  userVotes: {},
  isLoading: false,
  isPosting: false,

  fetchSolutions: async (questionId: string) => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true });

    const { data: solutionsData, error: solutionsError } = await supabase
      .from('solutions')
      .select('*, profiles(display_name)')
      .eq('question_id', questionId)
      .order('vote_count', { ascending: false })
      .limit(50);

    if (solutionsError) {
      console.error('Failed to fetch solutions:', solutionsError);
      set({ isLoading: false });
      return;
    }

    const solutions = (solutionsData || []) as Solution[];

    // Fetch user's votes for these solutions
    const { data: { user } } = await supabase.auth.getUser();
    let userVotes: Record<string, 1 | -1> = {};

    if (user && solutions.length > 0) {
      const solutionIds = solutions.map((s) => s.id);
      const { data: votesData } = await supabase
        .from('solution_votes')
        .select('solution_id, vote')
        .eq('user_id', user.id)
        .in('solution_id', solutionIds);

      if (votesData) {
        userVotes = {};
        for (const v of votesData) {
          userVotes[v.solution_id] = v.vote as 1 | -1;
        }
      }
    }

    set({ solutions, userVotes, isLoading: false });
  },

  postSolution: async (questionId: string, title: string, content: string, language: string) => {
    if (!isSupabaseConfigured) return;
    set({ isPosting: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isPosting: false });
      return;
    }

    const { data, error } = await supabase
      .from('solutions')
      .upsert(
        {
          user_id: user.id,
          question_id: questionId,
          title,
          content,
          language,
        },
        { onConflict: 'user_id,question_id' },
      )
      .select('*, profiles(display_name)')
      .single();

    set({ isPosting: false });

    if (error) {
      console.error('Failed to post solution:', error);
      throw error;
    }

    if (data) {
      const newSolution = data as Solution;
      set((state) => {
        const existing = state.solutions.findIndex((s) => s.user_id === user.id);
        if (existing >= 0) {
          const updated = [...state.solutions];
          updated[existing] = newSolution;
          return { solutions: updated };
        }
        return { solutions: [newSolution, ...state.solutions] };
      });
    }
  },

  voteSolution: async (solutionId: string, vote: 1 | -1) => {
    if (!isSupabaseConfigured) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentVote = get().userVotes[solutionId];

    // Optimistic update
    const voteDelta = currentVote ? vote - currentVote : vote;
    set((state) => {
      const newVotes = { ...state.userVotes };
      if (currentVote === vote) {
        // Toggle off: remove vote
        delete newVotes[solutionId];
      } else {
        newVotes[solutionId] = vote;
      }
      return {
        userVotes: newVotes,
        solutions: state.solutions.map((s) =>
          s.id === solutionId
            ? { ...s, vote_count: s.vote_count + (currentVote === vote ? -currentVote : voteDelta) }
            : s
        ),
      };
    });

    if (currentVote === vote) {
      // Remove vote
      const { error } = await supabase
        .from('solution_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('solution_id', solutionId);

      if (error) {
        console.error('Failed to remove vote:', error);
        // Revert optimistic update
        get().fetchSolutions(get().solutions[0]?.question_id || '');
      }
    } else {
      // Upsert vote
      const { error } = await supabase
        .from('solution_votes')
        .upsert(
          {
            user_id: user.id,
            solution_id: solutionId,
            vote,
          },
          { onConflict: 'user_id,solution_id' },
        );

      if (error) {
        console.error('Failed to vote:', error);
        // Revert optimistic update
        get().fetchSolutions(get().solutions[0]?.question_id || '');
      }
    }
  },
}));
