'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { allTools } from '@/lib/mock-data';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Database,
  Wrench,
  Plus,
  Download,
  Upload,
  Import,
  ChevronRight,
  Clock,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'workspace.dashboard' },
  { id: 'projects', icon: FolderKanban, labelKey: 'workspace.projects' },
  { id: 'files', icon: FileText, labelKey: 'workspace.files' },
  { id: 'data', icon: Database, labelKey: 'workspace.data' },
  { id: 'tools', icon: Wrench, labelKey: 'workspace.tools' },
] as const;

const QUICK_ACTIONS = [
  { id: 'project', icon: Plus, labelKey: 'workspace.createProject', color: 'from-violet-500 to-indigo-500' },
  { id: 'tool', icon: Download, label: 'Install Tool', color: 'from-blue-500 to-cyan-500' },
  { id: 'file', icon: Upload, label: 'Upload File', color: 'from-emerald-500 to-green-500' },
  { id: 'import', icon: Import, label: 'Import Data', color: 'from-amber-500 to-orange-500' },
] as const;

const MOCK_ACTIVITY = [
  { id: '1', title: 'PresenceVision', action: 'installed', time: '2 min ago', icon: '👁️' },
  { id: '2', title: 'Project Alpha', action: 'created', time: '1 hour ago', icon: '📁' },
  { id: '3', title: 'SENRIGAN', action: 'updated', time: '3 hours ago', icon: '🔮' },
  { id: '4', title: 'report.csv', action: 'uploaded', time: '5 hours ago', icon: '📄' },
  { id: '5', title: 'AI Writer Pro', action: 'installed', time: 'Yesterday', icon: '✍️' },
];

const STATS = [
  { id: 'projects', value: 12, labelKey: 'workspace.projects', icon: FolderKanban },
  { id: 'tools', value: 8, labelKey: 'workspace.tools', icon: Wrench },
  { id: 'files', value: 156, labelKey: 'workspace.files', icon: FileText },
  { id: 'data', value: '2.4 GB', labelKey: 'workspace.data', icon: Database },
] as const;

const installedTools = allTools.slice(0, 6);

export default function WorkspacePage() {
  const { t } = useTranslation();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileTab, setMobileTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile tabs */}
        <div className="lg:hidden flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 gap-1 scrollbar-hide">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMobileTab(item.id);
                setActiveNav(item.id);
              }}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeNav === item.id
                  ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <item.icon className="w-4 h-4" />
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('workspace.title')}
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  activeNav === item.id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {t(item.labelKey)}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t('workspace.dashboard')}
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Welcome back! Here&apos;s your workspace overview.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {STATS.map((stat) => (
                <Card key={stat.id} padding="md" className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(stat.labelKey)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('workspace.quickActions')}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <Card
                    key={action.id}
                    hover
                    padding="md"
                    onClick={() => {}}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center mb-3',
                        action.color
                      )}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {'labelKey' in action ? t(action.labelKey) : action.label}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* My Tools */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('workspace.myTools')}
                </h2>
                <Button variant="ghost" size="sm" className="gap-1">
                  {t('common.viewAll')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <div className="flex gap-4 min-w-max pb-2">
                  {installedTools.map((tool) => (
                    <Card
                      key={tool.id}
                      hover
                      padding="sm"
                      onClick={() => {}}
                      className="flex-shrink-0 w-24 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="w-14 h-14 mx-auto rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-2">
                        {tool.icon}
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate text-center">
                        {tool.name}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('workspace.recentActivity')}
              </h2>
              <Card padding="none">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {MOCK_ACTIVITY.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {item.action}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
