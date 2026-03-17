'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
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
import HowItWorksSection from '@/components/home/HowItWorksSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';

const MarketplacePage = dynamic(() => import('@/components/marketplace/MarketplacePage'), {
  loading: () => <PageLoader />,
});
const WorkspacePage = dynamic(() => import('@/components/workspace/WorkspacePage'), {
  loading: () => <PageLoader />,
});
const ToolStudioPage = dynamic(() => import('@/components/studio/ToolStudioPage'), {
  loading: () => <PageLoader />,
});
const AuthPage = dynamic(() => import('@/components/auth/AuthPage'), {
  loading: () => <PageLoader />,
});
const BillingPage = dynamic(() => import('@/components/billing/BillingPage'), {
  loading: () => <PageLoader />,
});
const AdminDashboardPage = dynamic(() => import('@/components/admin/AdminDashboardPage'), {
  loading: () => <PageLoader />,
});
const CreatorWalletPage = dynamic(() => import('@/components/revenue/CreatorWalletPage'), {
  loading: () => <PageLoader />,
});

export type PageView =
  | 'home'
  | 'discover'
  | 'workspace'
  | 'studio'
  | 'account'
  | 'auth'
  | 'billing'
  | 'admin'
  | 'wallet';

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isInitialized] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Eagerly initialize on first render in the browser
    const initialLocale = getInitialLocale();
    useLocaleStore.getState().setLocale(initialLocale);
    const initialTheme = getInitialTheme();
    useThemeStore.getState().setTheme(initialTheme);
    applyTheme(initialTheme);
    useAuthStore.getState().getInitialAuth();
    return true;
  });
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

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
      case 'studio':
        if (!isAuthenticated) return <AuthPage />;
        return <ToolStudioPage />;
      case 'auth':
        return isAuthenticated
          ? <BillingPage />
          : <AuthPage />;
      case 'account':
        if (!isAuthenticated) return <AuthPage />;
        return <BillingPage />;
      case 'billing':
        if (!isAuthenticated) return <AuthPage />;
        return <BillingPage />;
      case 'admin':
        if (!isAuthenticated) return <AuthPage />;
        if (user?.role !== 'admin') {
          return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-background">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                  <span className="text-3xl">🚫</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Access Denied
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  You do not have permission to access the admin dashboard. Admin role is required.
                </p>
              </div>
            </div>
          );
        }
        return <AdminDashboardPage />;
      case 'wallet':
        if (!isAuthenticated) return <AuthPage />;
        return <CreatorWalletPage />;
      case 'home':
      default:
        return (
          <>
            <HeroSection onNavigate={navigateTo} />
            <FeaturesSection />
            <CategoriesSection onNavigate={navigateTo} />
            <TrendingSection />
            <HowItWorksSection />
            <PricingSection onNavigate={navigateTo} />
            <OfficialToolsSection />
            <CTASection onNavigate={navigateTo} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={navigateTo} currentPage={currentPage} />
      <main id="main-content" className="pb-20 md:pb-0">
        {renderPage()}
      </main>
      <Footer />
      <MobileNav onNavigate={navigateTo} currentPage={currentPage} />
    </div>
  );
}
