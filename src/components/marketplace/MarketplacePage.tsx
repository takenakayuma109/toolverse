'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { allTools, categories } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { Search, Star, Users, ChevronRight, Flame, Globe, Award, LayoutGrid } from 'lucide-react';
import type { Tool, ToolCategory } from '@/types';

type SidebarSection = 'today' | 'trending' | 'webapps' | 'official' | ToolCategory;

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
};

// Featured content for each category
const featuredContent: Record<string, { tag: string; title: string; subtitle: string; tool: string; gradient: string }> = {
  ai: { tag: 'PICK OF THE MONTH', title: 'AI Writer Pro', subtitle: 'Create content at lightning speed with AI', tool: 'ai-writer-pro', gradient: 'from-violet-600 via-purple-600 to-fuchsia-600' },
  productivity: { tag: 'EDITORS\' CHOICE', title: 'TaskFlow', subtitle: 'Intelligent task management powered by AI', tool: 'task-flow', gradient: 'from-blue-600 via-cyan-600 to-teal-600' },
  finance: { tag: 'TOP FREE APP', title: 'FinTrack', subtitle: 'Track your finances effortlessly', tool: 'fintrack', gradient: 'from-emerald-600 via-green-600 to-lime-600' },
  marketing: { tag: 'NEW RELEASE', title: 'MarketSense', subtitle: 'Real-time marketing analytics and insights', tool: 'market-sense', gradient: 'from-orange-600 via-red-600 to-rose-600' },
  development: { tag: 'MAJOR UPDATE', title: 'CodePilot', subtitle: 'AI pair programming for modern developers', tool: 'code-pilot', gradient: 'from-slate-600 via-gray-600 to-zinc-600' },
  creator: { tag: 'FEATURED', title: 'DesignStudio', subtitle: 'AI-powered design for creators', tool: 'design-studio', gradient: 'from-pink-600 via-rose-600 to-red-600' },
  automation: { tag: 'TRENDING NOW', title: 'AutoFlow', subtitle: 'Build workflows without code', tool: 'auto-flow', gradient: 'from-amber-600 via-yellow-600 to-orange-600' },
  analytics: { tag: 'ESSENTIAL', title: 'DataLens', subtitle: 'Advanced data visualization', tool: 'data-lens', gradient: 'from-indigo-600 via-blue-600 to-cyan-600' },
  today: { tag: 'TODAY\'S PICK', title: 'SENRIGAN', subtitle: 'AI-powered foresight analytics platform', tool: 'senrigan', gradient: 'from-violet-600 via-indigo-600 to-purple-600' },
  trending: { tag: 'TRENDING', title: 'AI Writer Pro', subtitle: 'The most popular web app this week', tool: 'ai-writer-pro', gradient: 'from-rose-600 via-pink-600 to-fuchsia-600' },
  webapps: { tag: 'WEB APPS', title: 'Toolverse Web Apps', subtitle: 'Discover powerful web applications — no install needed', tool: 'presence-vision', gradient: 'from-cyan-600 via-blue-600 to-indigo-600' },
  official: { tag: 'OFFICIAL', title: 'PresenceVision', subtitle: 'AI-powered presence management by Toolverse', tool: 'presence-vision', gradient: 'from-violet-600 via-indigo-600 to-purple-600' },
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

  const getCategoryName = (id: string) => {
    const key = categoryI18nKeyMap[id] ?? id;
    return t(`home.categories.${key}`);
  };

  const sectionTitle = useMemo(() => {
    if (activeSection === 'today') return t('marketplace.today') || 'Today';
    if (activeSection === 'trending') return t('marketplace.trending');
    if (activeSection === 'webapps') return t('marketplace.webApps') || 'Web Apps';
    if (activeSection === 'official') return t('marketplace.official') || t('common.official');
    return getCategoryName(activeSection);
  }, [activeSection, t]);

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

  const featured = featuredContent[activeSection] || featuredContent.today;
  const featuredTool = allTools.find((t) => t.id === featured.tool);

  const topSections = [
    { id: 'today' as const, icon: <LayoutGrid className="w-5 h-5" />, label: t('marketplace.today') || 'Today' },
    { id: 'trending' as const, icon: <Flame className="w-5 h-5" />, label: t('marketplace.trending') },
    { id: 'webapps' as const, icon: <Globe className="w-5 h-5" />, label: t('marketplace.webApps') || 'Web Apps' },
    { id: 'official' as const, icon: <Award className="w-5 h-5" />, label: t('marketplace.official') || t('common.official') },
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
              featured.gradient,
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
                    {featured.tag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    {featured.title}
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base max-w-lg">
                    {featured.subtitle}
                  </p>
                  <div className="mt-5 flex items-center gap-4">
                    <AppIcon3D icon={featuredTool.icon} size="md" className="border-white/30" />
                    <div>
                      <p className="text-white font-semibold">{featuredTool.name}</p>
                      <p className="text-white/70 text-sm">{featuredTool.description}</p>
                    </div>
                    <button className="ml-auto flex-shrink-0 px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium transition-all border border-white/20">
                      {t('marketplace.view') || 'View'}
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
                {t('marketplace.essential') || 'Essential'} {sectionTitle} {t('marketplace.apps') || 'Apps'}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {t('marketplace.selectedByEditors') || 'Selected by Toolverse editors'}
            </p>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-4">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 group"
                  >
                    <AppIcon3D icon={tool.icon} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {tool.name}
                        </h4>
                        {tool.isOfficial && <Badge variant="gradient" size="sm">{t('common.official')}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {tool.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {tool.rating}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {formatNumber(tool.userCount)}
                        </span>
                        <span className="text-gray-400">
                          {tool.pricing.type === 'free' ? t('common.free') : tool.pricing.price ? `¥${tool.pricing.price}/mo` : t('common.freemium')}
                        </span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-violet-100 dark:hover:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-sm font-medium transition-all border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700">
                      {t('marketplace.view') || 'View'}
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
