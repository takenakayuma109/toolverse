import { create } from 'zustand';
import type { Locale } from '@/types';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'ja',
  setLocale: (locale) => {
    set({ locale });
    if (typeof window !== 'undefined') {
      localStorage.setItem('toolverse-locale', locale);
      document.documentElement.lang = locale;
    }
  },
}));

export function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('toolverse-locale') as Locale;
    if (saved === 'ja' || saved === 'en') return saved;
    const browserLang = navigator.language;
    if (browserLang.startsWith('ja')) return 'ja';
  }
  return 'ja';
}
