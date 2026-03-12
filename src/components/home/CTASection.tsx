'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Dark gradient background matching hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-black" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"
          style={{ top: '-20%', left: '-10%' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"
          style={{ bottom: '-20%', right: '-10%' }}
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
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          <Link href="/creator" className="inline-block mt-8 sm:mt-10">
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
          </Link>
        </div>
      </div>
    </section>
  );
}
