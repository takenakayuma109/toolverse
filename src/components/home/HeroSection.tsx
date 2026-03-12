'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { t } = useTranslation();

  const stats = [
    { value: '1,200+', labelKey: 'home.stats.tools' as const },
    { value: '500+', labelKey: 'home.stats.creators' as const },
    { value: '50K+', labelKey: 'home.stats.users' as const },
    { value: '30+', labelKey: 'home.stats.countries' as const },
  ];

  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-black" />

      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-violet-500/20 blur-3xl"
          style={{ top: '10%', left: '10%', animation: 'hero-float 20s ease-in-out infinite' }}
        />
        <div
          className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-indigo-500/15 blur-3xl"
          style={{ top: '60%', right: '5%', animation: 'hero-float 25s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-fuchsia-500/10 blur-3xl"
          style={{ bottom: '20%', left: '30%', animation: 'hero-float 18s ease-in-out infinite' }}
        />
        {/* Subtle particle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline with animated gradient */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-[length:200%_auto]"
              style={{ animation: 'hero-gradient 4s linear infinite' }}
            >
              {t('home.hero.title')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/discover">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto gap-2 group"
              >
                {t('home.hero.cta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/creator">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                <Sparkles className="w-5 h-5" />
                {t('home.hero.ctaSecondary')}
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map(({ value, labelKey }) => (
              <div key={labelKey} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {value}
                </div>
                <div className="mt-1 text-sm sm:text-base text-gray-400">
                  {t(labelKey)}
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
