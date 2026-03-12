'use client';

import { useState, useEffect } from 'react';
import { useLocaleStore, getInitialLocale } from '@/store/locale';
import { useThemeStore, getInitialTheme, applyTheme } from '@/store/theme';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import TrendingSection from '@/components/home/TrendingSection';
import OfficialToolsSection from '@/components/home/OfficialToolsSection';
import CTASection from '@/components/home/CTASection';
import MarketplacePage from '@/components/marketplace/MarketplacePage';
import WorkspacePage from '@/components/workspace/WorkspacePage';
import CreatorPage from '@/components/creator/CreatorPage';
import AuthPage from '@/components/auth/AuthPage';
import BillingPage from '@/components/billing/BillingPage';

type PageView = 'home' | 'discover' | 'workspace' | 'creator' | 'account' | 'auth' | 'billing';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocale(initialLocale);
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsInitialized(true);
  }, [setLocale, setTheme]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ page: PageView }>) => {
      setCurrentPage(e.detail.page);
    };
    window.addEventListener('navigate' as string, handler as EventListener);
    return () => window.removeEventListener('navigate' as string, handler as EventListener);
  }, []);

  useEffect(() => {
    window.dispatchEvent = ((original) => {
      return function (this: Window, event: Event) {
        return original.call(this, event);
      };
    })(window.dispatchEvent.bind(window));
  }, []);

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading Toolverse...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'discover':
        return <MarketplacePage />;
      case 'workspace':
        return <WorkspacePage />;
      case 'creator':
        return <CreatorPage />;
      case 'auth':
        return <AuthPage />;
      case 'billing':
        return <BillingPage />;
      case 'account':
        return <AuthPage />;
      case 'home':
      default:
        return (
          <>
            <HeroSection />
            <FeaturesSection />
            <CategoriesSection />
            <TrendingSection />
            <OfficialToolsSection />
            <CTASection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={navigateTo} currentPage={currentPage} />
      <main className="pb-20 md:pb-0">
        {renderPage()}
      </main>
      <Footer />
      <MobileNav onNavigate={navigateTo} currentPage={currentPage} />
    </div>
  );
}
