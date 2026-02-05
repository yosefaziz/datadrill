import { ReactNode } from 'react';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen bg-bg-primary flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
