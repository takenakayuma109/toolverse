import { create } from 'zustand';

export type Theme = 'universe' | 'earth';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'universe',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('toolverse-theme', theme);
      applyTheme(theme);
    }
  },
}));

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme === 'universe' ? 'dark' : 'offwhite');
  if (theme === 'universe') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('toolverse-theme') as Theme;
    if (saved === 'universe' || saved === 'earth') return saved;
    const legacy = localStorage.getItem('toolverse-theme');
    if (legacy === 'dark') return 'universe';
    if (legacy === 'offwhite') return 'earth';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'universe';
  }
  return 'universe';
}
