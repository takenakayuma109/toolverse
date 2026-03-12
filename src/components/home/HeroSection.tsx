'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);

  const stats = [
    { value: '1,200+', labelKey: 'home.stats.tools' as const },
    { value: '500+', labelKey: 'home.stats.creators' as const },
    { value: '50K+', labelKey: 'home.stats.users' as const },
    { value: '30+', labelKey: 'home.stats.countries' as const },
  ];

  const isOffwhite = theme === 'offwhite';

  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isOffwhite
            ? 'linear-gradient(135deg, #5b4a8a, #4a3d6e, #3d3054)'
            : undefined,
        }}
      >
        {!isOffwhite && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-black" />
        )}
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl"
          style={{
            top: '10%', left: '10%',
            animation: 'hero-float 20s ease-in-out infinite',
            backgroundColor: isOffwhite ? 'rgba(139, 115, 200, 0.25)' : 'rgba(139, 92, 246, 0.2)',
          }}
        />
        <div
          className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full blur-3xl"
          style={{
            top: '60%', right: '5%',
            animation: 'hero-float 25s ease-in-out infinite reverse',
            backgroundColor: isOffwhite ? 'rgba(120, 100, 180, 0.2)' : 'rgba(99, 102, 241, 0.15)',
          }}
        />
        <div
          className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl"
          style={{
            bottom: '20%', left: '30%',
            animation: 'hero-float 18s ease-in-out infinite',
            backgroundColor: isOffwhite ? 'rgba(160, 120, 180, 0.15)' : 'rgba(217, 70, 239, 0.1)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span
              className="bg-clip-text text-transparent bg-[length:200%_auto]"
              style={{
                backgroundImage: isOffwhite
                  ? 'linear-gradient(to right, #e0d0f0, #d4b8e8, #c8a8e0, #e0d0f0)'
                  : 'linear-gradient(to right, #c4b5fd, #e879f9, #818cf8, #c4b5fd)',
                animation: 'hero-gradient 4s linear infinite',
              }}
            >
              {t('home.hero.title')}
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: isOffwhite ? '#c4bab2' : undefined }}
          >
            <span className={isOffwhite ? '' : 'text-gray-400'}>{t('home.hero.subtitle')}</span>
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 group">
              {t('home.hero.cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              <Sparkles className="w-5 h-5" />
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map(({ value, labelKey }) => (
              <div key={labelKey} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {value}
                </div>
                <div className="mt-1 text-sm sm:text-base"
                  style={{ color: isOffwhite ? '#b8ada4' : undefined }}
                >
                  <span className={isOffwhite ? '' : 'text-gray-400'}>{t(labelKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hero-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.05); }
          50% { transform: translate(-15px, 20px) scale(0.95); }
          75% { transform: translate(30px, 10px) scale(1.02); }
        }
        @keyframes hero-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
    </section>
  );
}
