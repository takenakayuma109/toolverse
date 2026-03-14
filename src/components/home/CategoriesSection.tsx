'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';

const categoryI18nKeyMap: Record<string, string> = {
  creator: 'creatorTools',
};

type PageView = 'home' | 'discover' | 'workspace' | 'studio' | 'account' | 'auth' | 'billing' | 'admin';

interface CategoriesSectionProps {
  onNavigate?: (page: PageView) => void;
}

export default function CategoriesSection({ onNavigate }: CategoriesSectionProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const getCategoryName = (id: string) => {
    const key = categoryI18nKeyMap[id] ?? id;
    return t(`home.categories.${key}`);
  };

  return (
    <section className={cn(
      'px-4 sm:px-6 lg:px-8 py-24 md:py-32',
      isDark ? 'bg-white/[0.01]' : isEarth ? 'bg-gray-50/60' : 'bg-gray-50/80'
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className={cn(
            'text-sm font-semibold tracking-widest uppercase mb-3',
            isDark ? 'text-violet-400' : 'text-violet-600'
          )}>
            Categories
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('home.categories.title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate?.('discover')}
              className={cn(
                'group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-2',
                isDark
                  ? 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
                  : isEarth
                    ? 'bg-white/80 border border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                    : 'bg-white border border-gray-200/60 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200/40'
              )}
            >
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl',
                'bg-gradient-to-br shadow-sm',
                'group-hover:scale-105 transition-transform duration-200',
                cat.color
              )}>
                {cat.icon}
              </div>
              <span className="font-medium text-sm text-gray-700 dark:text-gray-300 text-center">
                {getCategoryName(cat.id)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
