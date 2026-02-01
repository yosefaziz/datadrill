import { create } from 'zustand';
import { Question, QuestionMeta, SkillType } from '@/types';

// Track the latest request to prevent race conditions
let latestQuestionRequestId = 0;

interface QuestionState {
  // Questions by skill
  questionsBySkill: Record<SkillType, QuestionMeta[]>;
  currentQuestion: Question | null;
  currentSkill: SkillType | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    difficulty: string | null;
    tag: string | null;
  };

  // Actions
  fetchQuestionsForSkill: (skill: SkillType) => Promise<void>;
  fetchQuestion: (skill: SkillType, id: string) => Promise<void>;
  setCurrentSkill: (skill: SkillType | null) => void;
  setDifficultyFilter: (difficulty: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  getFilteredQuestions: () => QuestionMeta[];
  getAllTags: () => string[];
  getQuestionCountBySkill: (skill: SkillType) => number;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questionsBySkill: {
    sql: [],
    pyspark: [],
    debug: [],
    architecture: [],
  },
  currentQuestion: null,
  currentSkill: null,
  isLoading: false,
  error: null,
  filters: {
    difficulty: null,
    tag: null,
  },

  fetchQuestionsForSkill: async (skill: SkillType) => {
    set({ isLoading: true, error: null, currentSkill: skill });
    try {
      const response = await fetch(`/questions/${skill}/index.json`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const questions = await response.json();
      set((state) => ({
        questionsBySkill: {
          ...state.questionsBySkill,
          [skill]: questions,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load questions',
        isLoading: false,
      });
    }
  },

  fetchQuestion: async (skill: SkillType, id: string) => {
    const requestId = ++latestQuestionRequestId;
    set({ isLoading: true, error: null, currentQuestion: null, currentSkill: skill });
    try {
      const response = await fetch(`/questions/${skill}/${id}.json`);
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

  setCurrentSkill: (skill) => {
    set({ currentSkill: skill });
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
    const { questionsBySkill, currentSkill, filters } = get();
    if (!currentSkill) return [];

    const questions = questionsBySkill[currentSkill];
    return questions.filter((q) => {
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
      if (filters.tag && !q.tags.includes(filters.tag)) return false;
      return true;
    });
  },

  getAllTags: () => {
    const { questionsBySkill, currentSkill } = get();
    if (!currentSkill) return [];

    const questions = questionsBySkill[currentSkill];
    const tags = new Set<string>();
    questions.forEach((q) => q.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  },

  getQuestionCountBySkill: (skill: SkillType) => {
    const { questionsBySkill } = get();
    return questionsBySkill[skill].length;
  },
}));
