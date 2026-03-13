'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import { Store, LayoutGrid, Sparkles, Code, Shield, Cpu } from 'lucide-react';

const features = [
  {
    id: 'marketplace',
    icon: Store,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'workspace',
    icon: LayoutGrid,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'creator',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'api',
    icon: Code,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'infrastructure',
    icon: Cpu,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'security',
    icon: Shield,
    gradient: 'from-slate-500 to-gray-700',
  },
] as const;

export default function FeaturesSection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className={cn(
            'inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4',
            isDark ? 'bg-violet-950/50 text-violet-300 border border-violet-800/50' :
            isEarth ? 'bg-violet-100/50 text-violet-700 border border-violet-200' :
            'bg-violet-50 text-violet-600 border border-violet-200'
          )}>
            PLATFORM
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('home.features.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map(({ id, icon: Icon, gradient }) => (
            <div
              key={id}
              className={cn(
                'group relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1',
                isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-violet-500/5' :
                isEarth ? 'bg-white/60 border-gray-200 hover:border-gray-300 hover:shadow-lg' :
                'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-violet-500/10'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
                  'bg-gradient-to-br shadow-lg',
                  gradient,
                  'group-hover:scale-110 transition-transform duration-300'
                )}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t(`home.features.${id}.title`)}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                {t(`home.features.${id}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
