import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { useThemeStore } from '@/stores/themeStore';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="h-screen bg-bg-primary flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
