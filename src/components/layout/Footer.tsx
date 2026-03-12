'use client';

import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import { Sparkles } from 'lucide-react';

const FOOTER_LINKS = {
  product: [
    { key: 'marketplace' },
    { key: 'workspace' },
    { key: 'creator' },
  ],
  company: [
    { key: 'about' },
    { key: 'blog' },
    { key: 'careers' },
    { key: 'contact' },
  ],
  resources: [
    { key: 'documentation' },
    { key: 'apiReference' },
    { key: 'sdkGuide' },
    { key: 'community' },
  ],
  legal: [
    { key: 'terms' },
    { key: 'privacy' },
    { key: 'cookies' },
  ],
} as const;

const SOCIAL_LINKS = [
  { name: 'Twitter', icon: '𝕏' },
  { name: 'GitHub', icon: '⌘' },
  { name: 'Discord', icon: '◈' },
] as const;

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-auto border-t border-transparent bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 hidden md:block">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="inline-flex items-center gap-2 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
              </span>
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                Toolverse
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-gray-600 dark:text-gray-400 break-words">
              {t('common.tagline')}
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ name, icon }) => (
                <button
                  key={name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                  aria-label={name}
                >
                  <span className="text-sm font-medium">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('footer.product')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.product.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    {t(`${key}.title`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('footer.company')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    {t(`footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('footer.resources')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.resources.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    {t(`footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('footer.legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.legal.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    {t(`footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-gray-200 dark:border-gray-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 min-w-0">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </footer>
  );
}
