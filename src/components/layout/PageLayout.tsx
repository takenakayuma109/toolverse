'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocaleStore, getInitialLocale } from '@/store/locale';
import { useThemeStore, getInitialTheme, applyTheme } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

type PageView = 'home' | 'discover' | 'workspace' | 'studio' | 'account' | 'auth' | 'billing' | 'admin' | 'wallet';

const PAGE_ROUTES: Record<PageView, string> = {
  home: '/',
  discover: '/discover',
  workspace: '/workspace',
  studio: '/studio',
  account: '/billing',
  auth: '/',
  billing: '/billing',
  admin: '/admin',
  wallet: '/wallet',
};

interface PageLayoutProps {
  children: React.ReactNode;
  currentPage?: PageView;
}

export default function PageLayout({ children, currentPage = 'home' }: PageLayoutProps) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    useLocaleStore.getState().setLocale(initialLocale);
    const initialTheme = getInitialTheme();
    useThemeStore.getState().setTheme(initialTheme);
    applyTheme(initialTheme);
    useAuthStore.getState().getInitialAuth();
    setIsInitialized(true);
  }, []);

  const navigateTo = (page: PageView) => {
    // Try SPA navigation first (if on home page), otherwise use router
    const route = PAGE_ROUTES[page] || '/';
    router.push(route);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={navigateTo} currentPage={currentPage} />
      <main id="main-content" className="pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav onNavigate={navigateTo} currentPage={currentPage} />
    </div>
  );
}
