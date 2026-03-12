'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { allTools, categories } from '@/lib/mock-data';
import ToolCard from '@/components/ui/ToolCard';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { Tool } from '@/types';

type FilterTab = 'all' | 'trending' | 'featured' | 'new';

const categoryLabels: Record<string, string> = {
  ai: 'AI',
  productivity: 'Productivity',
  finance: 'Finance',
  marketing: 'Marketing',
  development: 'Development',
  creator: 'Creator',
  automation: 'Automation',
  analytics: 'Analytics',
};

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const filteredTools = useMemo(() => {
    let tools: Tool[] = [...allTools];

    // Tab filter
    if (activeTab === 'trending') tools = tools.filter((t) => t.isTrending);
    else if (activeTab === 'featured') tools = tools.filter((t) => t.isFeatured);
    else if (activeTab === 'new') {
      tools = tools.filter((t) => {
        const created = new Date(t.createdAt).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return created > thirtyDaysAgo;
      });
    }

    // Category filter
    if (selectedCategory) {
      tools = tools.filter((t) => t.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return tools;
  }, [searchQuery, activeTab, selectedCategory]);

  const tabs: { id: FilterTab; labelKey: string }[] = [
    { id: 'all', labelKey: 'common.viewAll' },
    { id: 'trending', labelKey: 'marketplace.trending' },
    { id: 'featured', labelKey: 'marketplace.featured' },
    { id: 'new', labelKey: 'marketplace.newTools' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('marketplace.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('marketplace.subtitle')}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('common.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Category pills - horizontal scroll */}
        <div className="mt-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedCategory === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {t('marketplace.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <span>{cat.icon}</span>
                <span>{categoryLabels[cat.id] ?? cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: results count + sort */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {filteredTools.length}
            </span>{' '}
            {t('marketplace.results')}
          </p>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOpen(!sortOpen)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('marketplace.sortBy')}
              <ChevronDown
                className={cn('w-4 h-4 transition-transform', sortOpen && 'rotate-180')}
              />
            </Button>
            {sortOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {t('marketplace.rating')}
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {t('common.popular')}
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {t('common.new')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tool grid */}
        <div className="mt-6">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('marketplace.noResults')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('common.searchPlaceholder')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
