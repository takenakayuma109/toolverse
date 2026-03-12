'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn, formatCurrency } from '@/lib/utils';
import { communityTools } from '@/lib/mock-data';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Edit,
  Plus,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

const MOCK_STATS = {
  totalRevenue: 1234567,
  monthlyRevenue: 234567,
  totalUsers: 12500,
  activeUsers: 3400,
};

const SDK_INSTALL_CMD = 'npm install @toolverse/creator-sdk';
const SDK_SNIPPET = `import { Toolverse } from '@toolverse/creator-sdk';

const tool = new Toolverse({
  apiKey: process.env.TOOLVERSE_API_KEY,
});

await tool.publish({
  name: 'My Tool',
  description: 'An amazing tool',
});`;

export default function CreatorPage() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const myTools = communityTools.slice(0, 4);

  const copyInstallCmd = () => {
    navigator.clipboard.writeText(SDK_INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      id: 'total',
      value: formatCurrency(MOCK_STATS.totalRevenue),
      labelKey: 'creator.totalRevenue',
      icon: DollarSign,
      gradient: 'from-violet-500 to-indigo-500',
    },
    {
      id: 'monthly',
      value: formatCurrency(MOCK_STATS.monthlyRevenue),
      labelKey: 'creator.monthlyRevenue',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      id: 'users',
      value: MOCK_STATS.totalUsers.toLocaleString(),
      labelKey: 'creator.totalUsers',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'active',
      value: MOCK_STATS.activeUsers.toLocaleString(),
      labelKey: 'creator.activeUsers',
      icon: BarChart3,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('creator.title')}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t('creator.subtitle')}</p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.id} padding="lg" className="overflow-hidden relative">
              <div
                className={cn(
                  'absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 bg-gradient-to-br opacity-20',
                  stat.gradient
                )}
              />
              <div className="relative">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center mb-4',
                    stat.gradient
                  )}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(stat.labelKey)}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Published Tools */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Published Tools
                </h2>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('creator.publish')}
                </Button>
              </div>
              <div className="space-y-4">
                {myTools.map((tool) => (
                  <Card key={tool.id} padding="md" hover className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                        {tool.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {tool.name}
                          </h3>
                          <Badge variant="success" size="sm">
                            {t('creator.published')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="w-4 h-4" />
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {t('creator.analytics')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Revenue chart placeholder */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('creator.revenue')}
              </h2>
              <div className="h-64 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Revenue chart placeholder
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish CTA */}
            <Card
              padding="lg"
              className="bg-gradient-to-br from-violet-600 to-indigo-600 border-0 text-white"
            >
              <h3 className="font-semibold text-lg mb-2">Publish New Tool</h3>
              <p className="text-sm text-white/80 mb-4">
                Share your tool with the world and start earning.
              </p>
              <Button
                variant="secondary"
                size="md"
                className="w-full border-white/30 text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('creator.publish')}
              </Button>
            </Card>

            {/* SDK section */}
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('creator.sdk.title')}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('creator.sdk.description')}
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('creator.sdk.install')}
                  </p>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm overflow-x-auto pr-12">
                      {SDK_INSTALL_CMD}
                    </pre>
                    <button
                      onClick={copyInstallCmd}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Code snippet
                  </p>
                  <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs overflow-x-auto max-h-40 overflow-y-auto">
                    {SDK_SNIPPET}
                  </pre>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {t('creator.sdk.docs')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
