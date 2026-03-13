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

  // Try to fetch real data from API; fall back to mock data
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
        // API not available yet — keep using fallback mock data
      }
    }
    fetchOfficialTools();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className={cn(
      'px-4 sm:px-6 lg:px-8 py-20 md:py-28',
      isDark ? 'bg-gradient-to-b from-violet-950/20 to-transparent' :
      isEarth ? 'bg-gradient-to-b from-violet-50/30 to-transparent' :
      'bg-gradient-to-b from-violet-50/50 to-transparent'
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className={cn(
            'inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4',
            isDark ? 'bg-violet-950/50 text-violet-300 border border-violet-800/50' :
            isEarth ? 'bg-violet-100/50 text-violet-700 border border-violet-200' :
            'bg-violet-50 text-violet-600 border border-violet-200'
          )}>
            OFFICIAL
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('home.officialTools.title')}
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home.officialTools.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <div
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer',
                  isDark ? 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-violet-500/5' :
                  isEarth ? 'bg-white/70 border-gray-200 hover:border-gray-300 hover:shadow-lg' :
                  'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-violet-500/10'
                )}
              >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className={cn(
                    'flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl',
                    'bg-gradient-to-br shadow-lg',
                    'border border-white/10',
                    isDark ? 'from-violet-900/60 to-indigo-900/60 shadow-violet-500/10' :
                    'from-violet-100 to-indigo-100 shadow-violet-500/10'
                  )}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <Badge variant="gradient" size="md">
                        {t('common.official')}
                      </Badge>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {tool.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(tool.userCount)} {t('home.stats.users')}
                      </span>
                    </div>
                    <div className="mt-auto pt-6">
                      <Button
                        size="md"
                        variant="primary"
                        className="gap-2 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-shadow"
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
