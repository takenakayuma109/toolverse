'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
// Fallback mock data — replace with API fetch from /api/tools and /api/categories when available
import { allTools, categories } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { Search, Star, Users, ChevronRight, Flame, Globe, Award, LayoutGrid } from 'lucide-react';
import type { Tool, ToolCategory } from '@/types';

type SidebarSection = 'today' | 'trending' | 'webapps' | 'official' | ToolCategory;

const categoryI18nKeyMap: Record<string, string> = {
  creator: 'creatorTools',
};

// 3D-style icon backgrounds for categories
const categoryIconStyles: Record<string, { bg: string; shadow: string }> = {
  ai: { bg: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40' },
  productivity: { bg: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/40' },
  finance: { bg: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/40' },
  marketing: { bg: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/40' },
  development: { bg: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/40' },
  creator: { bg: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/40' },
  automation: { bg: 'from-amber-500 to-yellow-600', shadow: 'shadow-amber-500/40' },
  analytics: { bg: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/40' },
  security: { bg: 'from-red-500 to-rose-700', shadow: 'shadow-red-500/40' },
  healthcare: { bg: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/40' },
  education: { bg: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/40' },
  ecommerce: { bg: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/40' },
  communication: { bg: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/40' },
  iot: { bg: 'from-cyan-500 to-teal-600', shadow: 'shadow-cyan-500/40' },
  media: { bg: 'from-rose-500 to-orange-500', shadow: 'shadow-rose-500/40' },
  logistics: { bg: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/40' },
};

// Featured content keys for each section (references i18n keys)
const featuredSections: Record<string, { toolId: string; gradient: string }> = {
  ai: { toolId: 'ai-writer-pro', gradient: 'from-violet-600 via-purple-600 to-fuchsia-600' },
  productivity: { toolId: 'task-flow', gradient: 'from-blue-600 via-cyan-600 to-teal-600' },
  finance: { toolId: 'fintrack', gradient: 'from-emerald-600 via-green-600 to-lime-600' },
  marketing: { toolId: 'market-sense', gradient: 'from-orange-600 via-red-600 to-rose-600' },
  development: { toolId: 'code-pilot', gradient: 'from-slate-600 via-gray-600 to-zinc-600' },
  creator: { toolId: 'design-studio', gradient: 'from-pink-600 via-rose-600 to-red-600' },
  automation: { toolId: 'auto-flow', gradient: 'from-amber-600 via-yellow-600 to-orange-600' },
  analytics: { toolId: 'data-lens', gradient: 'from-indigo-600 via-blue-600 to-cyan-600' },
  security: { toolId: 'presence-vision', gradient: 'from-red-600 via-rose-600 to-pink-600' },
  healthcare: { toolId: 'presence-vision', gradient: 'from-teal-600 via-cyan-600 to-sky-600' },
  education: { toolId: 'presence-vision', gradient: 'from-sky-600 via-blue-600 to-indigo-600' },
  ecommerce: { toolId: 'presence-vision', gradient: 'from-fuchsia-600 via-pink-600 to-rose-600' },
  communication: { toolId: 'presence-vision', gradient: 'from-green-600 via-emerald-600 to-teal-600' },
  iot: { toolId: 'presence-vision', gradient: 'from-cyan-600 via-teal-600 to-green-600' },
  media: { toolId: 'design-studio', gradient: 'from-rose-600 via-orange-600 to-amber-600' },
  logistics: { toolId: 'presence-vision', gradient: 'from-purple-600 via-indigo-600 to-blue-600' },
  today: { toolId: 'senrigan', gradient: 'from-violet-600 via-indigo-600 to-purple-600' },
  trending: { toolId: 'ai-writer-pro', gradient: 'from-rose-600 via-pink-600 to-fuchsia-600' },
  webapps: { toolId: 'presence-vision', gradient: 'from-cyan-600 via-blue-600 to-indigo-600' },
  official: { toolId: 'presence-vision', gradient: 'from-violet-600 via-indigo-600 to-purple-600' },
};

function AppIcon3D({ icon, size = 'md', className }: { icon: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-10 h-10 text-xl rounded-xl',
    md: 'w-14 h-14 text-3xl rounded-2xl',
    lg: 'w-16 h-16 text-4xl rounded-2xl',
  };
  return (
    <div className={cn(
      sizes[size],
      'flex items-center justify-center',
      'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
      'shadow-lg shadow-black/10 dark:shadow-black/30',
      'border border-white/20 dark:border-white/5',
      'ring-1 ring-black/5 dark:ring-white/5',
      className
    )}>
      {icon}
    </div>
  );
}

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SidebarSection>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryName = useCallback((id: string) => {
    const key = categoryI18nKeyMap[id] ?? id;
    return t(`home.categories.${key}`);
  }, [t]);

  // Get translated tool name and description
  const getToolName = (tool: Tool) => {
    const key = tool.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const translated = t(`toolDescriptions.${key}.name`);
    return translated && !translated.startsWith('toolDescriptions.') ? translated : tool.name;
  };

  const getToolDescription = (tool: Tool) => {
    const key = tool.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const translated = t(`toolDescriptions.${key}.description`);
    return translated && !translated.startsWith('toolDescriptions.') ? translated : tool.description;
  };

  const sectionTitle = useMemo(() => {
    if (activeSection === 'today') return t('marketplace.today');
    if (activeSection === 'trending') return t('marketplace.trending');
    if (activeSection === 'webapps') return t('marketplace.webApps');
    if (activeSection === 'official') return t('marketplace.official');
    return getCategoryName(activeSection);
  }, [activeSection, t, getCategoryName]);

  const filteredTools = useMemo(() => {
    let tools: Tool[] = [...allTools];

    if (activeSection === 'trending') {
      tools = tools.filter((t) => t.isTrending);
    } else if (activeSection === 'official') {
      tools = tools.filter((t) => t.isOfficial);
    } else if (activeSection === 'webapps') {
      // All tools are web apps
    } else if (activeSection === 'today') {
      tools = tools.filter((t) => t.isFeatured || t.isTrending);
    } else {
      tools = tools.filter((t) => t.category === activeSection);
    }

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
  }, [activeSection, searchQuery]);

  const featuredSection = featuredSections[activeSection] || featuredSections.today;
  const featuredTool = allTools.find((t) => t.id === featuredSection.toolId);

  const topSections = [
    { id: 'today' as const, icon: <LayoutGrid className="w-5 h-5" />, label: t('marketplace.today') },
    { id: 'trending' as const, icon: <Flame className="w-5 h-5" />, label: t('marketplace.trending') },
    { id: 'webapps' as const, icon: <Globe className="w-5 h-5" />, label: t('marketplace.webApps') },
    { id: 'official' as const, icon: <Award className="w-5 h-5" />, label: t('marketplace.official') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Top nav sections */}
          <nav className="space-y-0.5">
            {topSections.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  activeSection === id
                    ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-lg',
                  activeSection === id
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}>
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </nav>

          {/* Categories */}
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              {t('marketplace.categories')}
            </h3>
            <nav className="space-y-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveSection(cat.id)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    activeSection === cat.id
                      ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-lg text-base',
                    'bg-gradient-to-br shadow-sm',
                    categoryIconStyles[cat.id]?.bg,
                    activeSection === cat.id ? 'scale-110' : ''
                  )}>
                    <span className="drop-shadow-sm">{cat.icon}</span>
                  </span>
                  {getCategoryName(cat.id)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile category bar */}
        <div className="lg:hidden sticky top-16 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide hide-scrollbar -mx-4 px-4 pb-1">
              {topSections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    activeSection === id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {label}
                </button>
              ))}
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveSection(cat.id)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    activeSection === cat.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {cat.icon} {getCategoryName(cat.id)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Section title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {sectionTitle}
          </h1>

          {/* Featured Hero Banner */}
          {featuredTool && (
            <div className={cn(
              'relative rounded-2xl overflow-hidden mb-8',
              'bg-gradient-to-br',
              featuredSection.gradient,
              'shadow-2xl'
            )}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
                }} />
              </div>
              <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 min-h-[220px] sm:min-h-[280px]">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-semibold tracking-wider mb-4">
                    {t(`marketplace.featured.${activeSection}.tag`)}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    {t(`marketplace.featured.${activeSection}.title`)}
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base max-w-lg">
                    {t(`marketplace.featured.${activeSection}.subtitle`)}
                  </p>
                  <div className="mt-5 flex items-center gap-4">
                    <AppIcon3D icon={featuredTool.icon} size="md" className="border-white/30" />
                    <div>
                      <p className="text-white font-semibold">{getToolName(featuredTool)}</p>
                      <p className="text-white/70 text-sm">{getToolDescription(featuredTool)}</p>
                    </div>
                    <button className="ml-auto flex-shrink-0 px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium transition-all border border-white/20">
                      {t('marketplace.view')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Essential Apps Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {t('marketplace.essential')} {sectionTitle} {t('marketplace.apps')}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {t('marketplace.selectedByEditors')}
            </p>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex gap-4 p-4 rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/[0.1] hover:shadow-md hover:shadow-gray-200/40 dark:hover:shadow-none transition-all group"
                  >
                    <AppIcon3D icon={tool.icon} size="lg" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-[15px] truncate">
                          {getToolName(tool)}
                        </h4>
                        {tool.isOfficial && <Badge variant="gradient" size="sm">{t('common.official')}</Badge>}
                        {tool.isTrending && <Badge variant="warning" size="sm">🔥</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {getToolDescription(tool)}
                      </p>
                      <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {tool.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {formatNumber(tool.userCount)}
                        </span>
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          {tool.pricing.type === 'free' ? t('common.free') : tool.pricing.price ? `¥${tool.pricing.price}/mo` : t('common.freemium')}
                        </span>
                      </div>
                    </div>
                    <button className="self-center flex-shrink-0 px-5 py-2 rounded-full bg-gray-100 dark:bg-white/[0.06] hover:bg-violet-100 dark:hover:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-sm font-semibold transition-all">
                      {t('marketplace.view')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t('marketplace.noResults')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
