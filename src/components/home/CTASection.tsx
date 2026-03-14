'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

type PageView = 'home' | 'discover' | 'workspace' | 'studio' | 'account' | 'auth' | 'billing' | 'admin';

interface CTASectionProps {
  onNavigate?: (page: PageView) => void;
}

export default function CTASection({ onNavigate }: CTASectionProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isEarth = theme === 'earth';

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isEarth
            ? 'linear-gradient(160deg, #1a1428 0%, #0f0d1a 50%, #0a0814 100%)'
            : 'linear-gradient(160deg, #0c0024 0%, #050012 50%, #020008 100%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: isEarth
            ? 'radial-gradient(ellipse, rgba(139,115,200,0.06) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            {t('home.cta.title')}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onNavigate?.('studio')}
              className="gap-2 group text-[15px] px-10 py-4 rounded-2xl shadow-xl shadow-violet-500/15 hover:shadow-violet-500/25 transition-all"
            >
              {t('home.cta.button')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
