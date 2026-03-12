'use client';

import { useThemeStore, type Theme } from '@/store/theme';
import { cn } from '@/lib/utils';
import { Moon, Sun, CloudSun } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const THEMES: { id: Theme; Icon: typeof Moon; labelJa: string; labelEn: string }[] = [
  { id: 'dark', Icon: Moon, labelJa: 'ダーク', labelEn: 'Dark' },
  { id: 'offwhite', Icon: CloudSun, labelJa: 'やさしい', labelEn: 'Soft' },
  { id: 'light', Icon: Sun, labelJa: 'ライト', labelEn: 'Light' },
];

export default function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();
  const { locale } = useTranslation();

  const currentIndex = THEMES.findIndex((t) => t.id === theme);
  const next = THEMES[(currentIndex + 1) % THEMES.length];

  return (
    <button
      onClick={() => setTheme(next.id)}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
        theme === 'dark'
          ? 'text-gray-400 hover:text-white hover:bg-gray-800'
          : theme === 'offwhite'
            ? 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        className
      )}
      aria-label="Switch theme"
      title={locale === 'ja' ? next.labelJa : next.labelEn}
    >
      {theme === 'dark' && <Moon className="w-4 h-4" />}
      {theme === 'offwhite' && <CloudSun className="w-4 h-4" />}
      {theme === 'light' && <Sun className="w-4 h-4" />}
      <span className="text-xs">
        {locale === 'ja'
          ? THEMES[currentIndex].labelJa
          : THEMES[currentIndex].labelEn}
      </span>
    </button>
  );
}
