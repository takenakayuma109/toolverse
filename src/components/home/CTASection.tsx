'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isOffwhite = theme === 'offwhite';

  return (
    <section className="relative overflow-hidden">
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
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            top: '-20%', left: '-10%',
            backgroundColor: isOffwhite ? 'rgba(139, 115, 200, 0.15)' : 'rgba(139, 92, 246, 0.1)',
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{
            bottom: '-20%', right: '-10%',
            backgroundColor: isOffwhite ? 'rgba(120, 100, 180, 0.15)' : 'rgba(99, 102, 241, 0.1)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {t('home.cta.title')}
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-relaxed"
            style={{ color: isOffwhite ? '#c4bab2' : undefined }}
          >
            <span className={isOffwhite ? '' : 'text-gray-400'}>{t('home.cta.subtitle')}</span>
          </p>
          <div className="inline-block mt-8 sm:mt-10">
            <Button
              size="lg"
              variant="primary"
              className={cn(
                'gap-2 group text-lg px-8 py-4',
                'bg-gradient-to-r from-violet-600 to-indigo-600',
                'hover:from-violet-500 hover:to-indigo-500',
                'shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40',
                'transition-all duration-300 hover:scale-105'
              )}
            >
              {t('home.cta.button')}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
