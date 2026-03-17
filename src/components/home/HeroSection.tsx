'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import HeroBackground from './HeroBackground';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

type PageView = 'home' | 'discover' | 'workspace' | 'studio' | 'account' | 'auth' | 'billing' | 'admin';

interface HeroSectionProps {
  onNavigate?: (page: PageView) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isEarth = theme === 'earth';

  const stats = [
    { value: '1,200+', labelKey: 'home.stats.tools' as const },
    { value: '500+', labelKey: 'home.stats.creators' as const },
    { value: '50K+', labelKey: 'home.stats.users' as const },
    { value: '30+', labelKey: 'home.stats.countries' as const },
  ];

  return (
    <section className="relative min-h-[92dvh] flex flex-col justify-center overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23030014' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-an-abstract-dark-tunnel-2481/1080p.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay gradient for readability */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: isEarth
              ? 'linear-gradient(160deg, rgba(26,20,40,0.82) 0%, rgba(15,13,26,0.88) 40%, rgba(10,8,20,0.85) 100%)'
              : 'linear-gradient(160deg, rgba(12,0,36,0.75) 0%, rgba(5,0,18,0.82) 40%, rgba(2,0,8,0.78) 100%)',
          }}
        />

        {/* Canvas particle layer on top of video */}
        <HeroBackground />

        {/* Subtle radial glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[120px] pointer-events-none"
          style={{
            background: isEarth
              ? 'radial-gradient(ellipse, rgba(139,115,200,0.08) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[13px] text-white/70 font-medium tracking-wide">
              {t('home.hero.badge')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            <span className="text-white">{t('home.hero.title')}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-400">
            {t('home.hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto sm:min-w-[240px] gap-2 group text-[15px] px-8 py-4 rounded-2xl shadow-xl shadow-violet-500/15 hover:shadow-violet-500/25 transition-shadow"
              onClick={() => onNavigate?.('discover')}
            >
              <Search className="w-4 h-4" />
              {t('home.hero.cta')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-[240px] gap-2 border-white/[0.12] text-white/90 hover:bg-white/[0.06] hover:border-white/20 backdrop-blur-sm text-[15px] px-8 py-4 rounded-2xl"
              onClick={() => onNavigate?.('studio')}
            >
              <Sparkles className="w-4 h-4" />
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>

          {/* Stats — glass cards */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
            {stats.map(({ value, labelKey }) => (
              <div
                key={labelKey}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl px-4 py-5 transition-colors hover:bg-white/[0.06]"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {value}
                </div>
                <div className="mt-1 text-[13px] text-gray-500 font-medium">
                  {t(labelKey)}
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-white/30 font-medium">
            <span>{t('home.hero.trust1')}</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>{t('home.hero.trust2')}</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>{t('home.hero.trust3')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
