'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import { ArrowRight, Play } from 'lucide-react';

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
    <section className="relative min-h-[90dvh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden">
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
        <div className="absolute inset-0 transition-colors duration-500"
          style={{
            background: isEarth
              ? 'linear-gradient(135deg, rgba(91,74,138,0.85), rgba(74,61,110,0.9), rgba(61,48,84,0.85))'
              : 'linear-gradient(135deg, rgba(3,0,20,0.7), rgba(15,5,40,0.75), rgba(3,0,20,0.7))',
          }}
        />
      </div>

      {/* Animated orbs behind content */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl"
          style={{ top: '10%', left: '10%', animation: 'hero-float 20s ease-in-out infinite',
            backgroundColor: isEarth ? 'rgba(139,115,200,0.15)' : 'rgba(139,92,246,0.12)' }} />
        <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full blur-3xl"
          style={{ top: '60%', right: '5%', animation: 'hero-float 25s ease-in-out infinite reverse',
            backgroundColor: isEarth ? 'rgba(120,100,180,0.12)' : 'rgba(99,102,241,0.1)' }} />
        <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl"
          style={{ bottom: '20%', left: '30%', animation: 'hero-float 18s ease-in-out infinite',
            backgroundColor: isEarth ? 'rgba(160,120,180,0.1)' : 'rgba(217,70,239,0.08)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/80 font-medium">{t('home.hero.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-[length:200%_auto]"
              style={{
                backgroundImage: isEarth
                  ? 'linear-gradient(to right, #e0d0f0, #d4b8e8, #c8a8e0, #e0d0f0)'
                  : 'linear-gradient(to right, #c4b5fd, #e879f9, #818cf8, #c4b5fd)',
                animation: 'hero-gradient 4s linear infinite',
              }}>
              {t('home.hero.title')}
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: isEarth ? '#c4bab2' : undefined }}>
            <span className={isEarth ? '' : 'text-gray-300'}>{t('home.hero.subtitle')}</span>
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 group whitespace-nowrap text-base px-8 py-4 shadow-xl shadow-violet-500/20"
              onClick={() => onNavigate?.('discover')}>
              {t('home.hero.cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline"
              className="w-full sm:w-auto gap-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 whitespace-nowrap backdrop-blur-sm"
              onClick={() => onNavigate?.('studio')}>
              <Play className="w-4 h-4" />
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map(({ value, labelKey }) => (
              <div key={labelKey} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{value}</div>
                <div className="mt-1 text-sm sm:text-base" style={{ color: isEarth ? '#b8ada4' : undefined }}>
                  <span className={isEarth ? '' : 'text-gray-400'}>{t(labelKey)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <span>{t('home.hero.trust1')}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{t('home.hero.trust2')}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{t('home.hero.trust3')}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-float { 0%,100%{transform:translate(0,0) scale(1)} 25%{transform:translate(20px,-30px) scale(1.05)} 50%{transform:translate(-15px,20px) scale(0.95)} 75%{transform:translate(30px,10px) scale(1.02)} }
        @keyframes hero-gradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
    </section>
  );
}
