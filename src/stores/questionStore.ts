import { create } from 'zustand';
import { Question, QuestionMeta, SkillType } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Track the latest request to prevent race conditions
let latestQuestionRequestId = 0;

export type QuestionStatus = 'passed' | 'failed' | 'not_started';
export type SortColumn = 'title' | 'difficulty' | 'status';
export type SortDirection = 'asc' | 'desc';

interface QuestionState {
  // Questions by skill
  questionsBySkill: Record<SkillType, QuestionMeta[]>;
  // Individual question cache
  questionsById: Record<string, Question>;
  // Status per question: question_id → 'passed' | 'failed'
  questionStatuses: Record<string, 'passed' | 'failed'>;
  currentQuestion: Question | null;
  currentSkill: SkillType | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    difficulty: string | null;
    tag: string | null;
    questionType: string | null;
    searchQuery: string;
    status: QuestionStatus | null;
  };
  sort: {
    column: SortColumn | null;
    direction: SortDirection;
  };

  // Actions
  fetchQuestionsForSkill: (skill: SkillType) => Promise<void>;
  fetchQuestion: (skill: SkillType, id: string) => Promise<void>;
  fetchQuestionStatuses: (skill: SkillType, userId: string) => Promise<void>;
  setCurrentSkill: (skill: SkillType | null) => void;
  setDifficultyFilter: (difficulty: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  setQuestionTypeFilter: (questionType: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: QuestionStatus | null) => void;
  toggleSort: (column: SortColumn) => void;
  getFilteredQuestions: () => QuestionMeta[];
  getQuestionStatus: (questionId: string) => QuestionStatus;
  getAllTags: () => string[];
  getAllQuestionTypes: () => string[];
  getQuestionCountBySkill: (skill: SkillType) => number;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questionsBySkill: {
    sql: [],
    python: [],
    debug: [],
    architecture: [],
    modeling: [],
    tools: [],
  },
  questionsById: {},
  questionStatuses: {},
  currentQuestion: null,
  currentSkill: null,
  isLoading: false,
  error: null,
  filters: {
    difficulty: null,
    tag: null,
    questionType: null,
    searchQuery: '',
    status: null,
  },
  sort: {
    column: null,
    direction: 'asc',
  },

  fetchQuestionsForSkill: async (skill: SkillType) => {
    // Check cache first - skip fetch if data already exists
    const existingQuestions = get().questionsBySkill[skill];
    if (existingQuestions.length > 0) {
      set({ currentSkill: skill, isLoading: false, error: null });
      return;
    }

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
    const cacheKey = `${skill}/${id}`;
    const cachedQuestion = get().questionsById[cacheKey];

    // Check cache first - skip fetch if question already loaded
    if (cachedQuestion) {
      set({ currentQuestion: cachedQuestion, currentSkill: skill, isLoading: false, error: null });
      return;
    }

    const requestId = ++latestQuestionRequestId;
    // Don't reset currentQuestion to null - prevents flash on navigation
    set({ isLoading: true, error: null, currentSkill: skill });
    try {
      const response = await fetch(`/questions/${skill}/${id}.json`);
      if (!response.ok) throw new Error('Question not found');
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error('Question not found');
      const question = await response.json();
      // Only update state if this is still the latest request
      if (requestId === latestQuestionRequestId) {
        set((state) => ({
          currentQuestion: question,
          questionsById: {
            ...state.questionsById,
            [cacheKey]: question,
          },
          isLoading: false,
        }));
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

  setQuestionTypeFilter: (questionType) => {
    set((state) => ({
      filters: { ...state.filters, questionType },
    }));
  },

  setSearchQuery: (searchQuery) => {
    set((state) => ({
      filters: { ...state.filters, searchQuery },
    }));
  },

  setStatusFilter: (status) => {
    set((state) => ({
      filters: { ...state.filters, status },
    }));
  },

  toggleSort: (column) => {
    set((state) => {
      if (state.sort.column === column) {
        // Same column: toggle direction, or clear if already desc
        if (state.sort.direction === 'asc') {
          return { sort: { column, direction: 'desc' } };
        }
        return { sort: { column: null, direction: 'asc' } };
      }
      return { sort: { column, direction: 'asc' } };
    });
  },

  fetchQuestionStatuses: async (skill: SkillType, userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('submissions')
      .select('question_id, passed')
      .eq('user_id', userId)
      .eq('skill', skill);

    if (error) {
      console.error('Failed to fetch question statuses:', error);
      return;
    }

    // Build status map: passed if any submission passed, else failed
    const statusMap: Record<string, 'passed' | 'failed'> = {};
    for (const row of data || []) {
      if (statusMap[row.question_id] === 'passed') continue;
      statusMap[row.question_id] = row.passed ? 'passed' : 'failed';
    }

    set((state) => ({
      questionStatuses: { ...state.questionStatuses, ...statusMap },
    }));
  },

  getQuestionStatus: (questionId: string) => {
    return get().questionStatuses[questionId] ?? 'not_started';
  },

  getFilteredQuestions: () => {
    const { questionsBySkill, currentSkill, filters, questionStatuses, sort } = get();
    if (!currentSkill) return [];

    const questions = questionsBySkill[currentSkill];
    const query = filters.searchQuery.toLowerCase();
    const filtered = questions.filter((q) => {
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
      if (filters.tag && !q.tags.includes(filters.tag)) return false;
      if (filters.questionType && q.questionType !== filters.questionType) return false;
      if (query && !q.title.toLowerCase().includes(query)) return false;
      if (filters.status) {
        const status = questionStatuses[q.id] ?? 'not_started';
        if (status !== filters.status) return false;
      }
      return true;
    });

    if (!sort.column) return filtered;

    const difficultyOrder: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
    const statusOrder: Record<string, number> = { passed: 0, failed: 1, not_started: 2 };
    const dir = sort.direction === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      switch (sort.column) {
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'difficulty':
          return dir * (difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        case 'status': {
          const sa = questionStatuses[a.id] ?? 'not_started';
          const sb = questionStatuses[b.id] ?? 'not_started';
          return dir * (statusOrder[sa] - statusOrder[sb]);
        }
        default:
          return 0;
      }
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

  getAllQuestionTypes: () => {
    const { questionsBySkill, currentSkill } = get();
    if (!currentSkill) return [];

    const questions = questionsBySkill[currentSkill];
    const types = new Set<string>();
    questions.forEach((q) => {
      if (q.questionType) types.add(q.questionType);
    });
    return Array.from(types).sort();
  },

  getQuestionCountBySkill: (skill: SkillType) => {
    const { questionsBySkill } = get();
    return questionsBySkill[skill].length;
  },
}));
