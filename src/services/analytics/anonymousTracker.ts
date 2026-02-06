import { AnonymousActivity, AnonymousAttempt, SkillType } from '@/types';

const ANON_ID_KEY = 'datadrill-anon-id';
const ANON_ACTIVITY_KEY = 'datadrill-anon-activity';

function generateId(): string {
  return crypto.randomUUID();
}

function getOrCreateId(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function getActivity(): AnonymousActivity {
  try {
    const raw = localStorage.getItem(ANON_ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt data, reset
  }

  const now = new Date().toISOString();
  return {
    id: getOrCreateId(),
    questionsViewed: [],
    attempts: [],
    totalSessionTime: 0,
    firstSeen: now,
    lastSeen: now,
  };
}

function saveActivity(activity: AnonymousActivity) {
  activity.lastSeen = new Date().toISOString();
  localStorage.setItem(ANON_ACTIVITY_KEY, JSON.stringify(activity));
}

export const anonymousTracker = {
  trackQuestionViewed(questionId: string) {
    const activity = getActivity();
    if (!activity.questionsViewed.includes(questionId)) {
      activity.questionsViewed.push(questionId);
    }
    saveActivity(activity);
  },

  trackAttempt(questionId: string, skill: SkillType, passed: boolean) {
    const activity = getActivity();
    const attempt: AnonymousAttempt = {
      questionId,
      skill,
      timestamp: new Date().toISOString(),
      passed,
    };
    activity.attempts.push(attempt);
    saveActivity(activity);
  },

  getActivity(): AnonymousActivity | null {
    try {
      const raw = localStorage.getItem(ANON_ACTIVITY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearAll() {
    localStorage.removeItem(ANON_ID_KEY);
    localStorage.removeItem(ANON_ACTIVITY_KEY);
    localStorage.removeItem('datadrill-anon-attempts');
  },
};
