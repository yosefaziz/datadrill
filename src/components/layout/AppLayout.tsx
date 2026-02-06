import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  useEffect(() => {
    initializeTheme();
    initializeAuth();
  }, [initializeTheme, initializeAuth]);

  const showOnboarding = user !== null && profile !== null && !profile.onboarding_completed;

  return (
    <div className="min-h-screen lg:h-screen bg-bg-primary flex flex-col overflow-auto">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 flex flex-col min-h-0">{children}</main>
      <AuthModal />
      {showOnboarding && <OnboardingModal />}
    </div>
  );
}
