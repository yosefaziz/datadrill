import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, OnboardingSurvey } from '@/types';

type AuthModalView = 'initial' | 'sign_in' | 'sign_up';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, captchaToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (survey: OnboardingSurvey) => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  openAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalView: 'initial' as AuthModalView,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Skip if same user already set (e.g. token refresh on tab visibility)
        if (get().user?.id === session.user.id) return;

        set({ user: session.user });
        await get().fetchProfile();

        // Migrate anonymous activity on sign-in
        try {
          const anonActivity = localStorage.getItem('datadrill-anon-activity');
          if (anonActivity) {
            const activity = JSON.parse(anonActivity);
            await supabase
              .from('profiles')
              .update({ pre_registration_activity: activity })
              .eq('id', session.user.id);

            localStorage.removeItem('datadrill-anon-id');
            localStorage.removeItem('datadrill-anon-activity');
            localStorage.removeItem('datadrill-anon-attempts');
          }
        } catch {
          // Non-critical: don't block auth on migration failure
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null });
      }
    });
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  },

  signInWithGitHub: async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  },

  signInWithLinkedIn: async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  },

  signInWithEmail: async (email: string, password: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithEmail: async (email: string, password: string, captchaToken: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { captchaToken },
    });
    if (error) throw error;
  },

  signOut: async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },

  fetchProfile: async () => {
    if (!isSupabaseConfigured) return;
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error);
      return;
    }

    set({ profile: data as UserProfile });
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured) return;
    const user = get().user;
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    }));
  },

  completeOnboarding: async (survey: OnboardingSurvey) => {
    if (!isSupabaseConfigured) return;
    const user = get().user;
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username: survey.username,
        role: survey.role,
        primary_goal: survey.primary_goal,
        weakest_skill: survey.weakest_skill,
        birth_year: survey.birth_year,
        gender: survey.gender,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (error) throw error;

    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            username: survey.username,
            role: survey.role,
            primary_goal: survey.primary_goal,
            weakest_skill: survey.weakest_skill,
            birth_year: survey.birth_year,
            gender: survey.gender,
            onboarding_completed: true,
          }
        : null,
    }));
  },

  checkUsernameAvailable: async (username: string) => {
    if (!isSupabaseConfigured) return false;
    const { data, error } = await supabase.rpc('check_username_available', {
      requested_username: username,
    });
    if (error) throw error;
    return data as boolean;
  },

  updatePassword: async (newPassword: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  deleteAccount: async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.rpc('delete_user_account');
    if (error) throw error;
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  openAuthModal: () => {
    set({ isAuthModalOpen: true, authModalView: 'initial' });
  },

  setAuthModalView: (view: AuthModalView) => {
    set({ authModalView: view });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },
}));
