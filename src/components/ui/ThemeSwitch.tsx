'use client';

import { useThemeStore, type Theme } from '@/store/theme';
import { cn } from '@/lib/utils';
import { Moon, Sun, CloudSun } from 'lucide-react';

const THEMES: { id: Theme; Icon: typeof Moon; label: string }[] = [
  { id: 'universe', Icon: Moon, label: 'Universe' },
  { id: 'earth', Icon: CloudSun, label: 'Earth' },
  { id: 'light', Icon: Sun, label: 'Light' },
];

export default function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  const currentIndex = THEMES.findIndex((t) => t.id === theme);
  const next = THEMES[(currentIndex + 1) % THEMES.length];
  const current = THEMES[currentIndex];

  return (
    <button
      onClick={() => setTheme(next.id)}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
        theme === 'universe'
          ? 'text-gray-400 hover:text-white hover:bg-gray-800'
          : theme === 'earth'
            ? 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        className
      )}
      aria-label="Switch theme"
      title={next.label}
    >
      <current.Icon className="w-4 h-4" />
      <span className="text-xs">{current.label}</span>
    </button>
  );
}
