import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { anonymousTracker } from '@/services/analytics/anonymousTracker';

export function useAnonymousTracking(questionId: string | undefined) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user && questionId) {
      anonymousTracker.trackQuestionViewed(questionId);
    }
  }, [user, questionId]);
}
