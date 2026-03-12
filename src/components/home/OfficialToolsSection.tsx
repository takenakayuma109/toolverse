'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { officialTools } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Star, Users } from 'lucide-react';
import Link from 'next/link';

export default function OfficialToolsSection() {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gradient-to-b from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('home.officialTools.title')}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home.officialTools.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {officialTools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <div
                className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 md:p-8 hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600" />

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 flex items-center justify-center text-4xl">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <Badge variant="gradient" size="md">
                        Official
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {tool.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(tool.userCount)} {t('home.stats.users')}
                      </span>
                    </div>
                    <Button
                      size="md"
                      variant="primary"
                      className="mt-6 group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-shadow"
                    >
                      {t('marketplace.install')}
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
