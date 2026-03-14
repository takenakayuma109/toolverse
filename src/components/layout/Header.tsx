'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import Input from '@/components/ui/Input';
import { Menu, X, Search, Sparkles, Upload, Shield, User, LogOut, CreditCard, Wallet } from 'lucide-react';

type PageView = 'home' | 'discover' | 'workspace' | 'studio' | 'account' | 'auth' | 'billing' | 'admin' | 'wallet';

const NAV_ITEMS = [
  { key: 'home' },
  { key: 'discover' },
  { key: 'workspace' },
  { key: 'studio' },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]['key'];

interface HeaderProps {
  onNavigate: (page: PageView) => void;
  currentPage: PageView;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-user-menu]')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleNav = (key: NavKey) => {
    onNavigate(key as PageView);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border-b border-gray-200/40 dark:border-white/[0.06]'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label={t('nav.home')}
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Toolverse
            </span>
          </button>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ key }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-200',
                  currentPage === key
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {t(`nav.${key}`)}
                {currentPage === key && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-gray-900 dark:bg-white" />
                )}
              </button>
            ))}
          </nav>

          {/* Search */}
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
                  className="border-0 bg-gray-100 dark:bg-white/[0.06] rounded-lg h-9 text-sm"
                  autoFocus
                  onBlur={() => setSearchExpanded(false)}
                />
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={t('common.search')}
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <ThemeSwitch className="hidden sm:inline-flex" />
            <LanguageSwitch className="hidden sm:inline-flex" />

            {isAuthenticated && user ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-32 truncate">
                    {user.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200/80 dark:border-white/[0.08] py-1.5 z-[60]">
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { onNavigate('workspace'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <User className="w-4 h-4 text-gray-400" /> {t('nav.workspace')}
                      </button>
                      <button onClick={() => { onNavigate('studio'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <Upload className="w-4 h-4 text-gray-400" /> {t('nav.studio')}
                      </button>
                      <button onClick={() => { onNavigate('billing'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <CreditCard className="w-4 h-4 text-gray-400" /> {t('nav.billing') || 'Billing'}
                      </button>
                      <button onClick={() => { onNavigate('wallet' as PageView); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <Wallet className="w-4 h-4 text-gray-400" /> Creator Wallet
                      </button>
                      {user.role === 'admin' && (
                        <button onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20">
                          <Shield className="w-4 h-4" /> {t('nav.admin')}
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] pt-1">
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <LogOut className="w-4 h-4" /> {t('common.signOut') || 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onNavigate('auth')}
                  className="text-sm font-medium px-3.5 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t('common.signIn')}
                </button>
                <button
                  onClick={() => onNavigate('auth')}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  {t('common.signUp')}
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-out',
            mobileMenuOpen ? 'max-h-[80vh] overflow-y-auto opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="border-t border-gray-200/60 dark:border-white/[0.06] py-3 space-y-0.5">
            {NAV_ITEMS.map(({ key }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={cn(
                  'flex items-center w-full px-4 py-3 rounded-lg text-[15px] font-medium transition-colors text-left',
                  currentPage === key
                    ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                )}
              >
                {t(`nav.${key}`)}
              </button>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-[15px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20"
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
            )}
            <div className="flex sm:hidden flex-wrap items-center gap-2 px-4 pt-4 border-t border-gray-200/60 dark:border-white/[0.06] mt-3">
              <ThemeSwitch />
              <LanguageSwitch />
              {isAuthenticated ? (
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="flex-1 text-sm font-medium px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  {t('common.signOut') || 'Sign Out'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { onNavigate('auth'); setMobileMenuOpen(false); }}
                    className="flex-1 text-sm font-medium px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  >
                    {t('common.signIn')}
                  </button>
                  <button
                    onClick={() => { onNavigate('auth'); setMobileMenuOpen(false); }}
                    className="flex-1 text-sm font-medium px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  >
                    {t('common.signUp')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
