'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { officialTools as fallbackTools } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Star, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Tool } from '@/types';

export default function OfficialToolsSection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const [tools, setTools] = useState<Tool[]>(fallbackTools);

  useEffect(() => {
    let cancelled = false;
    async function fetchOfficialTools() {
      try {
        const res = await fetch('/api/tools?isOfficial=true');
        if (!res.ok) return;
        const data: Tool[] = await res.json();
        if (!cancelled && data.length > 0) {
          setTools(data);
        }
      } catch {
        // API not available yet
      }
    }
    fetchOfficialTools();
    return () => { cancelled = true; };
  }, []);

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
            Official
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('home.officialTools.title')}
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-[15px]">
            {t('home.officialTools.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <div
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-7 md:p-8 transition-all duration-200 cursor-pointer',
                  isDark
                    ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                    : isEarth
                      ? 'bg-white/80 border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                      : 'bg-white border-gray-200/60 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
                )}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className={cn(
                    'flex-shrink-0 w-18 h-18 rounded-2xl flex items-center justify-center text-4xl',
                    isDark ? 'bg-white/[0.04]' : 'bg-gray-100'
                  )}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <Badge variant="gradient" size="md">
                        {t('common.official')}
                      </Badge>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[15px] line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-5 mt-4 text-sm text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {tool.rating}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {formatNumber(tool.userCount)} {t('home.stats.users')}
                      </span>
                    </div>
                    <div className="mt-5">
                      <Button
                        size="md"
                        variant="primary"
                        className="gap-2 rounded-xl"
                      >
                        {t('marketplace.install')}
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
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
