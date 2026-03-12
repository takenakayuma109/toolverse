'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Store, LayoutGrid, Sparkles, Code } from 'lucide-react';

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
] as const;

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">
          {t('home.features.title')}
        </h2>

        <div className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {features.map(({ id, icon: Icon, gradient }) => (
            <Card
              key={id}
              hover
              padding="lg"
              className="group transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div
                  className={cn(
                    'flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br shadow-lg',
                    gradient,
                    'group-hover:scale-110 transition-transform duration-300'
                  )}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    {t(`home.features.${id}.title`)}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(`home.features.${id}.description`)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
