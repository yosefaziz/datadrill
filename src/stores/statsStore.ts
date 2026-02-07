import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SkillType, SkillStats, UserStats, Submission } from '@/types';

const ALL_SKILLS: SkillType[] = ['sql', 'pyspark', 'debug', 'architecture', 'modeling'];

interface QuestionTotals {
  [skill: string]: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

interface StatsState {
  stats: UserStats | null;
  selectedSkill: SkillType | null;
  isLoading: boolean;
  fetchStats: (userId: string) => Promise<void>;
  setSelectedSkill: (skill: SkillType | null) => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: null,
  selectedSkill: null,
  isLoading: false,

  fetchStats: async (userId: string) => {
    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }
    // Only show loading spinner on first fetch, not background refreshes
    if (!get().stats) {
      set({ isLoading: true });
    }

    try {
      // Fetch all user submissions
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('question_id, skill, difficulty, passed')
        .eq('user_id', userId);

      if (error) throw error;

      // Fetch question totals from the index JSONs
      const totals = await fetchQuestionTotals();

      // Compute stats
      const stats = computeStats((submissions || []) as Pick<Submission, 'question_id' | 'skill' | 'difficulty' | 'passed'>[], totals);
      set({ stats, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      set({ isLoading: false });
    }
  },

  setSelectedSkill: (skill) => set({ selectedSkill: skill }),
}));

async function fetchQuestionTotals(): Promise<QuestionTotals> {
  const totals: QuestionTotals = {};

  await Promise.all(
    ALL_SKILLS.map(async (skill) => {
      try {
        const res = await fetch(`/questions/${skill}/index.json`);
        if (!res.ok) return;
        const questions: { difficulty: string }[] = await res.json();
        totals[skill] = { Easy: 0, Medium: 0, Hard: 0 };
        for (const q of questions) {
          if (q.difficulty === 'Easy' || q.difficulty === 'Medium' || q.difficulty === 'Hard') {
            totals[skill][q.difficulty]++;
          }
        }
      } catch {
        totals[skill] = { Easy: 0, Medium: 0, Hard: 0 };
      }
    })
  );

  return totals;
}

function computeStats(
  submissions: Pick<Submission, 'question_id' | 'skill' | 'difficulty' | 'passed'>[],
  totals: QuestionTotals
): UserStats {
  // Track solved questions (at least one passing submission)
  const solvedQuestions = new Set<string>();
  const attemptedQuestions = new Set<string>();

  // Per-skill solved sets by difficulty
  const skillSolved: Record<string, Record<string, Set<string>>> = {};
  for (const skill of ALL_SKILLS) {
    skillSolved[skill] = { Easy: new Set(), Medium: new Set(), Hard: new Set() };
  }

  for (const sub of submissions) {
    attemptedQuestions.add(sub.question_id);
    if (sub.passed) {
      solvedQuestions.add(sub.question_id);
      const diff = sub.difficulty;
      if (diff === 'Easy' || diff === 'Medium' || diff === 'Hard') {
        skillSolved[sub.skill]?.[diff]?.add(sub.question_id);
      }
    }
  }

  const skills: SkillStats[] = ALL_SKILLS.map((skill) => {
    const t = totals[skill] || { Easy: 0, Medium: 0, Hard: 0 };
    const easySolved = skillSolved[skill].Easy.size;
    const mediumSolved = skillSolved[skill].Medium.size;
    const hardSolved = skillSolved[skill].Hard.size;

    const earned = easySolved * 1 + mediumSolved * 2 + hardSolved * 3;
    const max = t.Easy * 1 + t.Medium * 2 + t.Hard * 3;
    const mastery = max > 0 ? (earned / max) * 100 : 0;

    return {
      skill,
      easySolved,
      easyTotal: t.Easy,
      mediumSolved,
      mediumTotal: t.Medium,
      hardSolved,
      hardTotal: t.Hard,
      mastery,
    };
  });

  return {
    totalSolved: solvedQuestions.size,
    totalAttempted: attemptedQuestions.size,
    passRate: attemptedQuestions.size > 0 ? (solvedQuestions.size / attemptedQuestions.size) * 100 : 0,
    skills,
  };
}
