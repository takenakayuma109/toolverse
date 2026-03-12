'use client';

import { useState, useEffect } from 'react';
import { useLocaleStore, getInitialLocale } from '@/store/locale';
import { useThemeStore, getInitialTheme, applyTheme } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
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
import ToolStudioPage from '@/components/studio/ToolStudioPage';
import AuthPage from '@/components/auth/AuthPage';
import BillingPage from '@/components/billing/BillingPage';
import AdminDashboardPage from '@/components/admin/AdminDashboardPage';

export type PageView =
  | 'home'
  | 'discover'
  | 'workspace'
  | 'studio'
  | 'account'
  | 'auth'
  | 'billing'
  | 'admin';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setTheme = useThemeStore((s) => s.setTheme);
  const getInitialAuth = useAuthStore((s) => s.getInitialAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocale(initialLocale);
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    getInitialAuth();
    setIsInitialized(true);
  }, [setLocale, setTheme, getInitialAuth]);

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
      case 'studio':
        return <ToolStudioPage />;
      case 'auth':
      case 'account':
        return isAuthenticated
          ? <WorkspacePage />
          : <AuthPage />;
      case 'billing':
        return <BillingPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'home':
      default:
        return (
          <>
            <HeroSection onNavigate={navigateTo} />
            <FeaturesSection />
            <CategoriesSection onNavigate={navigateTo} />
            <TrendingSection />
            <OfficialToolsSection />
            <CTASection onNavigate={navigateTo} />
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
