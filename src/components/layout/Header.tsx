'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import Input from '@/components/ui/Input';
import { Menu, X, Search, Sparkles } from 'lucide-react';

type PageView = 'home' | 'discover' | 'workspace' | 'creator' | 'account' | 'auth' | 'billing';

const NAV_ITEMS = [
  { key: 'home' },
  { key: 'discover' },
  { key: 'workspace' },
  { key: 'creator' },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]['key'];

interface HeaderProps {
  onNavigate: (page: PageView) => void;
  currentPage: PageView;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (key: NavKey) => {
    onNavigate(key as PageView);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 shrink-0 group"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 shadow-lg shadow-violet-500/30 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Toolverse
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ key }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  currentPage === key
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                )}
              >
                {t(`nav.${key}`)}
                {currentPage === key && (
                  <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <div
              className={cn(
                'flex items-center overflow-hidden transition-all duration-300 ease-out',
                searchExpanded ? 'w-56' : 'w-10'
              )}
            >
              {searchExpanded ? (
                <Input
                  icon={<Search className="h-4 w-4" />}
                  placeholder={t('common.searchPlaceholder')}
                  className="border-0 bg-gray-100 dark:bg-gray-800/80 rounded-xl h-9 text-sm"
                  autoFocus
                  onBlur={() => setSearchExpanded(false)}
                />
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:text-violet-600 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  aria-label={t('common.search')}
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch className="hidden sm:inline-flex" />
            <LanguageSwitch className="hidden sm:inline-flex" />

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 text-sm px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]"
              >
                {t('common.signIn')}
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 text-sm px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 active:scale-[0.98]"
              >
                {t('common.signUp')}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-out',
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="border-t border-gray-200 dark:border-gray-800 py-4 space-y-1">
            {NAV_ITEMS.map(({ key }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={cn(
                  'flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-colors text-left',
                  currentPage === key
                    ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {t(`nav.${key}`)}
              </button>
            ))}
            <div className="flex sm:hidden items-center gap-2 px-4 pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
              <ThemeSwitch />
              <LanguageSwitch />
              <button
                onClick={() => { onNavigate('auth'); setMobileMenuOpen(false); }}
                className="flex-1 inline-flex items-center justify-center font-medium rounded-xl text-sm px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]"
              >
                {t('common.signIn')}
              </button>
              <button
                onClick={() => { onNavigate('auth'); setMobileMenuOpen(false); }}
                className="flex-1 inline-flex items-center justify-center font-medium rounded-xl text-sm px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 active:scale-[0.98]"
              >
                {t('common.signUp')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
