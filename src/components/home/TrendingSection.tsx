'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ToolCard from '@/components/ui/ToolCard';
import { allTools as fallbackTools } from '@/lib/mock-data';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Tool } from '@/types';

export default function TrendingSection() {
  const { t } = useTranslation();

  // Try to fetch real trending data from API; fall back to mock data
  const [trendingTools, setTrendingTools] = useState<Tool[]>(
    fallbackTools.filter((tool) => tool.isTrending),
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchTrending() {
      try {
        const res = await fetch('/api/tools?isTrending=true');
        if (!res.ok) return;
        const data: Tool[] = await res.json();
        if (!cancelled && data.length > 0) {
          setTrendingTools(data);
        }
      } catch {
        // API not available yet — keep using fallback mock data
      }
    }
    fetchTrending();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('marketplace.trending')}
          </h2>
          <Link
            href="/discover?sort=trending"
            className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            {t('common.viewAll')}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto -mx-4 sm:mx-0 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-3 gap-6 min-w-max md:min-w-0 px-4 sm:px-0">
            {trendingTools.map((tool) => (
              <div
                key={tool.id}
                className="w-[280px] md:w-auto flex-shrink-0 md:flex-shrink"
              >
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
