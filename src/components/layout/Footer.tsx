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
    <footer className="relative mt-auto border-t border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-gray-950 hidden md:block">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Toolverse
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('common.tagline')}
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIAL_LINKS.map(({ name, icon }) => (
                <button
                  key={name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200/60 dark:border-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/[0.12] transition-all duration-200"
                  aria-label={name}
                >
                  <span className="text-sm">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('footer.product')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.product.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {t(`${key}.title`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('footer.company')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {t(`footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('footer.resources')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.resources.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {t(`footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('footer.legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.legal.map(({ key }) => (
                <li key={key}>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {t(`footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-gray-200/60 dark:border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400 dark:text-gray-500">
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
