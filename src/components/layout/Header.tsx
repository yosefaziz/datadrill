import { Link } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="bg-bg-secondary text-text-primary px-6 py-4 shadow-lg border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
          DataDrill
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-text-secondary hover:text-primary transition-colors"
          >
            Questions
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-bg-primary transition-colors"
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM7 11a1 1 0 100-2 1 1 0 000 2zm-4.536-.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm10.607 2.121a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM17 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
