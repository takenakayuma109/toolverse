'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
// Fallback categories — replace with API fetch when /api/categories is available
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
      'px-4 sm:px-6 lg:px-8 py-20 md:py-28',
      isDark ? 'bg-gray-950/50' : isEarth ? 'bg-gray-50/50' : 'bg-gray-50'
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className={cn(
            'inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4',
            isDark ? 'bg-violet-950/50 text-violet-300 border border-violet-800/50' :
            isEarth ? 'bg-violet-100/50 text-violet-700 border border-violet-200' :
            'bg-violet-50 text-violet-600 border border-violet-200'
          )}>
            CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('home.categories.title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate?.('discover')}
              className={cn(
                'group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl',
                'transition-all duration-300 hover:-translate-y-1',
                'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
                isDark ? 'bg-gray-900/60 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-violet-500/5' :
                isEarth ? 'bg-white/70 border border-gray-200 hover:border-gray-300 hover:shadow-md' :
                'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl',
                  'bg-gradient-to-br shadow-lg',
                  'border border-white/20 dark:border-white/5',
                  'group-hover:scale-110 transition-transform duration-300',
                  cat.color
                )}
              >
                {cat.icon}
              </div>
              <span className="font-medium text-sm text-gray-700 dark:text-gray-200 text-center">
                {getCategoryName(cat.id)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
