import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const THEME_KEY = 'datadrill-theme';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',

  setTheme: (theme: Theme) => {
    set({ theme });
    localStorage.setItem(THEME_KEY, theme);

    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  initializeTheme: () => {
    // Check localStorage first
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved) {
      get().setTheme(saved);
      return;
    }

    // Then check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      get().setTheme('dark');
    } else {
      get().setTheme('light');
    }
  },
}));
