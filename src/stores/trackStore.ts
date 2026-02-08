import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SkillType, SkillTrack, SkillTrackMeta, TrackProgress } from '@/types';

interface TrackState {
  tracksBySkill: Record<SkillType, SkillTrackMeta[]>;
  tracksById: Record<string, SkillTrack>;
  trackProgress: Record<string, TrackProgress>;
  isLoading: boolean;

  fetchTracksForSkill: (skill: SkillType) => Promise<void>;
  fetchTrack: (trackId: string) => Promise<void>;
  fetchTrackProgress: (userId: string) => Promise<void>;
  computeProgress: (trackId: string, completedQuestionIds: Set<string>) => TrackProgress | null;
  getTracksGroupedByCategory: (skill: SkillType) => Record<string, SkillTrackMeta[]>;
}

export const useTrackStore = create<TrackState>((set, get) => ({
  tracksBySkill: {
    sql: [],
    python: [],
    debug: [],
    architecture: [],
    modeling: [],
  },
  tracksById: {},
  trackProgress: {},
  isLoading: false,

  fetchTracksForSkill: async (skill: SkillType) => {
    const existing = get().tracksBySkill[skill];
    if (existing.length > 0) return;

    set({ isLoading: true });
    try {
      const response = await fetch(`/questions/${skill}/tracks/index.json`);
      if (!response.ok) {
        // No tracks for this skill — that's fine
        set({ isLoading: false });
        return;
      }
      const tracks: SkillTrackMeta[] = await response.json();
      set((state) => ({
        tracksBySkill: { ...state.tracksBySkill, [skill]: tracks },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTrack: async (trackId: string) => {
    if (get().tracksById[trackId]) return;

    set({ isLoading: true });
    try {
      // Determine skill from trackId prefix (e.g., "sql-window-rolling" → "sql")
      const skill = trackId.split('-')[0] as SkillType;
      const response = await fetch(`/questions/${skill}/tracks/${trackId}.json`);
      if (!response.ok) throw new Error('Track not found');
      const track: SkillTrack = await response.json();
      set((state) => ({
        tracksById: { ...state.tracksById, [trackId]: track },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTrackProgress: async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('track_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch track progress:', error);
      return;
    }

    const progress: Record<string, TrackProgress> = {};
    for (const row of data || []) {
      progress[row.track_id] = {
        trackId: row.track_id,
        completedQuestionIds: [],
        currentLevel: row.current_level,
        percentComplete: Number(row.percent_complete),
      };
    }
    set({ trackProgress: progress });
  },

  computeProgress: (trackId: string, completedQuestionIds: Set<string>) => {
    const track = get().tracksById[trackId];
    if (!track) return null;

    const allQuestionIds = track.levels.flatMap((l) => l.questionIds);
    const completed = allQuestionIds.filter((id) => completedQuestionIds.has(id));
    const percentComplete = allQuestionIds.length > 0
      ? Math.round((completed.length / allQuestionIds.length) * 100)
      : 0;

    // Determine current level — first level with incomplete questions
    let currentLevel = 1;
    for (const level of track.levels) {
      const levelComplete = level.questionIds.every((id) => completedQuestionIds.has(id));
      if (levelComplete) {
        currentLevel = level.level + 1;
      } else {
        currentLevel = level.level;
        break;
      }
    }

    return {
      trackId,
      completedQuestionIds: completed,
      currentLevel: Math.min(currentLevel, track.levels.length),
      percentComplete,
    };
  },

  getTracksGroupedByCategory: (skill: SkillType) => {
    const tracks = get().tracksBySkill[skill];
    const grouped: Record<string, SkillTrackMeta[]> = {};
    for (const track of tracks) {
      if (!grouped[track.category]) {
        grouped[track.category] = [];
      }
      grouped[track.category].push(track);
    }
    return grouped;
  },
}));
