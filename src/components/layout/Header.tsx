import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, openAuthModal } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-primary'
        : 'text-text-secondary hover:text-primary'
    }`;

  return (
    <header className="bg-bg-secondary/80 backdrop-blur-md text-text-primary px-6 py-4 shadow-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
          DataDrill
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className={navLinkClass('/')}>
            Practice
          </Link>
          <Link to="/interview" className={navLinkClass('/interview')}>
            Mock Interview
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                Insights
              </Link>
              <Link to="/history" className={navLinkClass('/history')}>
                History
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-bg-primary hover:text-primary transition-colors"
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </button>
          {user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
