'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';

const categoryI18nKeyMap: Record<string, string> = {
  creator: 'creatorTools',
};

export default function CategoriesSection() {
  const { t } = useTranslation();

  const getCategoryName = (id: string) => {
    const key = categoryI18nKeyMap[id] ?? id;
    return t(`home.categories.${key}`);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {t('home.categories.title')}
        </h2>

        <div className="mt-10 overflow-x-auto -mx-4 sm:mx-0 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 min-w-max md:min-w-0 px-4 sm:px-0">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/discover?category=${cat.id}`}
                className={cn(
                  'flex items-center gap-4 p-5 rounded-2xl min-w-[200px] md:min-w-0',
                  'bg-gradient-to-br bg-white dark:bg-gray-800/80',
                  'border border-gray-100 dark:border-gray-700',
                  'hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                    'bg-gradient-to-br',
                    cat.color
                  )}
                >
                  {cat.icon}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getCategoryName(cat.id)}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
