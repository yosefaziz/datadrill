import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';

export function useAuthGate() {
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const isAuthenticated = !!user;

  const requireAuth = useCallback((): boolean => {
    if (!isAuthenticated) {
      openAuthModal();
      return false;
    }
    return true;
  }, [isAuthenticated, openAuthModal]);

  return { isAuthenticated, user, requireAuth };
}

export function useSubmissionGate(questionId: string) {
  const user = useAuthStore((s) => s.user);
  const questionSubmissions = useSubmissionStore((s) => s.questionSubmissions);
  const fetchQuestionSubmissions = useSubmissionStore((s) => s.fetchQuestionSubmissions);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && fetchedRef.current !== `${user.id}:${questionId}`) {
      fetchedRef.current = `${user.id}:${questionId}`;
      fetchQuestionSubmissions(user.id, questionId);
    }
  }, [user, questionId, fetchQuestionSubmissions]);

  const hasSubmitted = !!user && questionSubmissions.some(
    (s) => s.question_id === questionId
  );

  return { hasSubmitted };
}
