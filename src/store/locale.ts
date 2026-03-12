import { create } from 'zustand';
import type { Locale } from '@/types';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const SUPPORTED_LOCALES: Locale[] = [
  'ja', 'en', 'zh', 'ko', 'fr', 'de', 'es', 'pt', 'ar', 'ru', 'hi',
];

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'ja',
  setLocale: (locale) => {
    set({ locale });
    if (typeof window !== 'undefined') {
      localStorage.setItem('toolverse-locale', locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  },
}));

const BROWSER_LANG_MAP: Record<string, Locale> = {
  ja: 'ja',
  en: 'en',
  zh: 'zh',
  ko: 'ko',
  fr: 'fr',
  de: 'de',
  es: 'es',
  pt: 'pt',
  ar: 'ar',
  ru: 'ru',
  hi: 'hi',
};

export function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('toolverse-locale') as Locale;
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;

    const browserLang = navigator.language;
    const primary = browserLang.split('-')[0];
    const mapped = BROWSER_LANG_MAP[primary];
    if (mapped) return mapped;
  }
  return 'ja';
}
