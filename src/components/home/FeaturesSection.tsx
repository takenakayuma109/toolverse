'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import { Store, LayoutGrid, Sparkles, Code, Shield, Cpu } from 'lucide-react';

const features = [
  { id: 'marketplace', icon: Store, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { id: 'workspace', icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'creator', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'api', icon: Code, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'infrastructure', icon: Cpu, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'security', icon: Shield, color: 'text-slate-500', bg: 'bg-slate-500/10' },
] as const;

export default function FeaturesSection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className={cn(
            'text-sm font-semibold tracking-widest uppercase mb-3',
            isDark ? 'text-violet-400' : isEarth ? 'text-violet-600' : 'text-violet-600'
          )}>
            Platform
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('home.features.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map(({ id, icon: Icon, color, bg }) => (
            <div
              key={id}
              className={cn(
                'group relative p-7 sm:p-8 rounded-2xl border transition-all duration-200',
                isDark
                  ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  : isEarth
                    ? 'bg-white/80 border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                    : 'bg-white border-gray-200/60 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-5', bg)}>
                <Icon className={cn('w-6 h-6', color)} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t(`home.features.${id}.title`)}
              </h3>
              <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {t(`home.features.${id}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
