import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  InterviewScenarioMeta,
  InterviewScenario,
  RoundResult,
  InterviewSessionResult,
} from '@/types';

interface InterviewState {
  // Catalog
  scenarios: InterviewScenarioMeta[];
  scenariosLoading: boolean;
  scenariosById: Record<string, InterviewScenario>;

  // Active session
  activeScenario: InterviewScenario | null;
  currentRoundIndex: number;
  roundResults: RoundResult[];
  sessionStartedAt: number | null;
  roundStartedAt: number | null;
  isComplete: boolean;

  // Session history
  sessionHistory: InterviewSessionResult[];

  // Actions
  fetchScenarios: () => Promise<void>;
  fetchScenario: (scenarioId: string) => Promise<void>;
  startSession: (scenarioId: string) => void;
  submitRound: (result: Omit<RoundResult, 'roundId'>) => void;
  nextRound: () => void;
  endSession: () => void;
  resetSession: () => void;
  saveSessionToSupabase: (userId: string) => Promise<void>;
  fetchSessionHistory: (userId: string) => Promise<void>;
  getCurrentRound: () => InterviewScenario['rounds'][number] | null;
  getOverallScore: () => number;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  scenarios: [],
  scenariosLoading: false,
  scenariosById: {},
  activeScenario: null,
  currentRoundIndex: 0,
  roundResults: [],
  sessionStartedAt: null,
  roundStartedAt: null,
  isComplete: false,
  sessionHistory: [],

  fetchScenarios: async () => {
    if (get().scenarios.length > 0) return;

    set({ scenariosLoading: true });
    try {
      const response = await fetch('/interviews/index.json');
      if (!response.ok) {
        set({ scenariosLoading: false });
        return;
      }
      const scenarios: InterviewScenarioMeta[] = await response.json();
      set({ scenarios, scenariosLoading: false });
    } catch {
      set({ scenariosLoading: false });
    }
  },

  fetchScenario: async (scenarioId: string) => {
    if (get().scenariosById[scenarioId]) return;

    set({ scenariosLoading: true });
    try {
      const response = await fetch(`/interviews/${scenarioId}.json`);
      if (!response.ok) {
        set({ scenariosLoading: false });
        return;
      }
      const scenario: InterviewScenario = await response.json();
      set((state) => ({
        scenariosById: { ...state.scenariosById, [scenarioId]: scenario },
        scenariosLoading: false,
      }));
    } catch {
      set({ scenariosLoading: false });
    }
  },

  startSession: (scenarioId: string) => {
    const scenario = get().scenariosById[scenarioId];
    if (!scenario) return;

    const now = Date.now();
    set({
      activeScenario: scenario,
      currentRoundIndex: 0,
      roundResults: [],
      sessionStartedAt: now,
      roundStartedAt: now,
      isComplete: false,
    });
  },

  submitRound: (result) => {
    const { activeScenario, currentRoundIndex, roundResults } = get();
    if (!activeScenario) return;

    const round = activeScenario.rounds[currentRoundIndex];
    if (!round) return;

    const roundResult: RoundResult = {
      roundId: round.id,
      ...result,
    };

    set({ roundResults: [...roundResults, roundResult] });
  },

  nextRound: () => {
    const { activeScenario, currentRoundIndex } = get();
    if (!activeScenario) return;

    const nextIndex = currentRoundIndex + 1;
    if (nextIndex >= activeScenario.rounds.length) {
      get().endSession();
      return;
    }

    set({
      currentRoundIndex: nextIndex,
      roundStartedAt: Date.now(),
    });
  },

  endSession: () => {
    set({ isComplete: true });
  },

  resetSession: () => {
    set({
      activeScenario: null,
      currentRoundIndex: 0,
      roundResults: [],
      sessionStartedAt: null,
      roundStartedAt: null,
      isComplete: false,
    });
  },

  saveSessionToSupabase: async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { activeScenario, roundResults, sessionStartedAt } = get();
    if (!activeScenario) return;

    const overallScore = get().getOverallScore();

    const { error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: userId,
        scenario_id: activeScenario.id,
        category: activeScenario.category,
        level: activeScenario.level,
        started_at: sessionStartedAt ? new Date(sessionStartedAt).toISOString() : new Date().toISOString(),
        completed_at: new Date().toISOString(),
        overall_score: overallScore,
        round_results: roundResults,
      });

    if (error) {
      console.error('Failed to save interview session:', error);
    }
  },

  fetchSessionHistory: async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch session history:', error);
      return;
    }

    const sessions: InterviewSessionResult[] = (data || []).map((row) => ({
      scenarioId: row.scenario_id,
      category: row.category,
      level: row.level,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      roundResults: row.round_results as RoundResult[],
      overallScore: row.overall_score,
    }));

    set({ sessionHistory: sessions });
  },

  getCurrentRound: () => {
    const { activeScenario, currentRoundIndex } = get();
    if (!activeScenario) return null;
    return activeScenario.rounds[currentRoundIndex] ?? null;
  },

  getOverallScore: () => {
    const { activeScenario, roundResults } = get();
    if (!activeScenario || roundResults.length === 0) return 0;

    const totalRounds = activeScenario.rounds.length;
    const totalScore = roundResults.reduce((sum, r) => sum + r.score, 0);
    return totalScore / totalRounds;
  },
}));
