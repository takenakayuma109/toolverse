'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn, formatNumber } from '@/lib/utils';
// Fallback mock data — replace with API fetch from /api/tools when available
import { communityTools } from '@/lib/mock-data';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  ShieldCheck,
  Settings,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Globe,
  Activity,
  Database,
  Layers,
  BarChart3,
  LineChart,
  Map,
  UserPlus,
  Ban,
  Flag,
  Eye,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Star,
  MessageSquare,
} from 'lucide-react';

type AdminSection = 'overview' | 'users' | 'tools' | 'revenue' | 'moderation' | 'settings' | 'infrastructure';

const NAV_ITEMS: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'tools', label: 'Tools', icon: Package },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
];

function formatBigNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const MOCK_PENDING_TOOLS = communityTools.slice(0, 4).map((t, i) => ({
  ...t,
  submittedAt: ['2 hours ago', '5 hours ago', '1 day ago', '2 days ago'][i],
  flagReason: i === 2 ? 'Suspected policy violation' : undefined,
}));

const MOCK_RECENT_USERS = [
  { id: 'u1', name: 'Tanaka Yuki', email: 'tanaka@example.com', joinedAt: '3 min ago', role: 'creator' as const },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@example.com', joinedAt: '12 min ago', role: 'user' as const },
  { id: 'u3', name: 'Alex Kim', email: 'alex@example.com', joinedAt: '28 min ago', role: 'user' as const },
  { id: 'u4', name: 'Müller Hans', email: 'hans@example.com', joinedAt: '1 hour ago', role: 'creator' as const },
  { id: 'u5', name: 'Priya Sharma', email: 'priya@example.com', joinedAt: '2 hours ago', role: 'user' as const },
];

const SYSTEM_SERVICES = [
  { name: 'API Gateway', latency: '23ms', status: 'healthy' as const, uptime: '99.99%' },
  { name: 'CDN', latency: '8ms', status: 'healthy' as const, uptime: '99.97%' },
  { name: 'Database Primary', latency: '4ms', status: 'healthy' as const, uptime: '99.99%' },
  { name: 'Database Replica', latency: '6ms', status: 'healthy' as const, uptime: '99.98%' },
  { name: 'Queue Workers', latency: '12ms', status: 'warning' as const, uptime: '99.92%' },
  { name: 'Search Index', latency: '18ms', status: 'healthy' as const, uptime: '99.96%' },
  { name: 'Cache Layer', latency: '1ms', status: 'healthy' as const, uptime: '99.99%' },
  { name: 'ML Pipeline', latency: '145ms', status: 'healthy' as const, uptime: '99.88%' },
];

const REGIONS = [
  { name: 'US East', load: 67, instances: 48, status: 'healthy' as const },
  { name: 'US West', load: 54, instances: 32, status: 'healthy' as const },
  { name: 'EU West', load: 72, instances: 44, status: 'healthy' as const },
  { name: 'EU Central', load: 61, instances: 28, status: 'healthy' as const },
  { name: 'Asia Pacific (Tokyo)', load: 83, instances: 56, status: 'warning' as const },
  { name: 'Asia Pacific (Singapore)', load: 45, instances: 24, status: 'healthy' as const },
  { name: 'South America', load: 38, instances: 16, status: 'healthy' as const },
  { name: 'Middle East', load: 29, instances: 12, status: 'healthy' as const },
];

const STATUS_COLORS = {
  healthy: { bg: 'bg-emerald-500', text: 'text-emerald-500', badge: 'success' as const },
  warning: { bg: 'bg-amber-500', text: 'text-amber-500', badge: 'warning' as const },
  critical: { bg: 'bg-red-500', text: 'text-red-500', badge: 'error' as const },
};

export default function AdminDashboardPage() {
  const { } = useTranslation();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [userSearch, setUserSearch] = useState('');

  const topStats = [
    { label: 'Total Users', value: 287_432_156, icon: Users, gradient: 'from-violet-500 to-indigo-500', change: '+2.4%', up: true },
    { label: 'Active Today', value: 42_156_789, icon: Activity, gradient: 'from-blue-500 to-cyan-500', change: '+5.1%', up: true },
    { label: 'Total Tools', value: 1_234_567, icon: Package, gradient: 'from-emerald-500 to-green-500', change: '+1.8%', up: true },
    { label: 'Revenue (MTD)', value: '$12,456,789', icon: DollarSign, gradient: 'from-amber-500 to-orange-500', change: '+12.3%', up: true, raw: true },
    { label: 'Pending Reviews', value: 2_341, icon: Clock, gradient: 'from-rose-500 to-pink-500', change: '+156', up: false, alert: true },
    { label: 'System Health', value: '99.97%', icon: CheckCircle2, gradient: 'from-teal-500 to-emerald-500', change: 'Operational', up: true, raw: true },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection topStats={topStats} />;
      case 'users':
        return <UsersSection userSearch={userSearch} setUserSearch={setUserSearch} />;
      case 'tools':
        return <ToolsSection />;
      case 'revenue':
        return <RevenueSection />;
      case 'moderation':
        return <ModerationSection />;
      case 'settings':
        return <SettingsSection />;
      case 'infrastructure':
        return <InfrastructureSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Mobile Tabs */}
      <div className="lg:hidden overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                activeSection === item.id
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-16 overflow-y-auto self-start">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Admin</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toolverse Platform</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 pb-6 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeSection === item.id
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
                {item.id === 'moderation' && (
                  <Badge variant="error" size="sm" className="ml-auto">4</Badge>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-200/50 dark:border-violet-800/30">
            <div className="flex items-center gap-2 mb-1">
              <CircleDot className="w-3 h-3 text-emerald-500 animate-pulse" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">All Systems Operational</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">24 regions active</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview Section                                                    */
/* ------------------------------------------------------------------ */

function OverviewSection({ topStats }: { topStats: { label: string; value: number | string; icon: typeof Users; gradient: string; change: string; up: boolean; raw?: boolean; alert?: boolean }[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Platform Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time metrics across Toolverse.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {topStats.map((stat) => (
          <Card key={stat.label} padding="md" className="overflow-hidden relative group">
            <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity', stat.gradient)} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center', stat.gradient)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  stat.alert ? 'text-amber-500' : stat.up ? 'text-emerald-500' : 'text-red-500'
                )}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : stat.alert ? <AlertTriangle className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {stat.raw ? stat.value : formatBigNumber(stat.value as number)}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">User Growth</h3>
            <Badge variant="default" size="sm">Last 30 days</Badge>
          </div>
          <ChartPlaceholder icon={LineChart} label="User growth line chart" />
        </Card>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <Badge variant="default" size="sm">Last 12 months</Badge>
          </div>
          <ChartPlaceholder icon={BarChart3} label="Revenue bar chart" />
        </Card>
      </div>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Geographic Distribution</h3>
          <Badge variant="default" size="sm">Live</Badge>
        </div>
        <ChartPlaceholder icon={Map} label="World map — user distribution heatmap" tall />
      </Card>

      {/* System Status Quick */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">System Status</h3>
          <Badge variant="success" size="sm">All Operational</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'API Latency', value: '23ms', icon: Zap, ok: true },
            { label: 'CDN', value: 'Operational', icon: Globe, ok: true },
            { label: 'Database', value: 'Healthy', icon: Database, ok: true },
            { label: 'Queue', value: '1,234 pending', icon: Layers, ok: true },
            { label: 'Regions', value: '24 active', icon: Server, ok: true },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', item.ok ? 'bg-emerald-500' : 'bg-red-500')} />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Users Section                                                       */
/* ------------------------------------------------------------------ */

function UsersSection({ userSearch, setUserSearch }: { userSearch: string; setUserSearch: (s: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatBigNumber(287_432_156)} total registered users</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'New Today', value: '156,234', icon: UserPlus, gradient: 'from-violet-500 to-indigo-500' },
          { label: 'Creators', value: '2.4M', icon: Package, gradient: 'from-emerald-500 to-green-500' },
          { label: 'Banned', value: '12,456', icon: Ban, gradient: 'from-red-500 to-rose-500' },
        ].map((s) => (
          <Card key={s.label} padding="md" className="relative overflow-hidden">
            <div className={cn('absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-1/2 translate-x-1/2 bg-gradient-to-br opacity-15', s.gradient)} />
            <div className="relative flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center', s.gradient)}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Signups</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {MOCK_RECENT_USERS.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center gap-4 p-4 sm:px-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <Badge variant={user.role === 'creator' ? 'info' : 'default'} size="sm">{user.role}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{user.joinedAt}</span>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Ban className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tools Section                                                       */
/* ------------------------------------------------------------------ */

function ToolsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tool Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatBigNumber(1_234_567)} tools on the platform</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: '2,341', badge: 'warning' as const },
          { label: 'Flagged', value: '127', badge: 'error' as const },
          { label: 'Published Today', value: '1,456', badge: 'success' as const },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              <Badge variant={s.badge} size="sm">{s.badge === 'error' ? 'Needs attention' : s.badge === 'warning' ? 'Pending' : 'Today'}</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Top Performing */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Top Performing Tools</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {communityTools.slice(0, 5).map((tool, i) => (
            <div key={tool.id} className="flex items-center gap-4 p-4 sm:px-5">
              <span className="text-sm font-bold text-gray-400 w-6 text-center shrink-0">#{i + 1}</span>
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0">{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tool.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">by {tool.creatorName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(tool.userCount)} users</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-gray-500">{tool.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Flagged Tools */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Flagged Tools</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {MOCK_PENDING_TOOLS.filter((t) => t.flagReason).map((tool) => (
            <div key={tool.id} className="flex items-center gap-4 p-4 sm:px-5">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-lg shrink-0">{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tool.name}</p>
                <p className="text-xs text-red-500">{tool.flagReason}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm">Review</Button>
                <Button variant="danger" size="sm">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue Section                                                     */
/* ------------------------------------------------------------------ */

function RevenueSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide financial overview</p>
      </div>
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'MTD Revenue', value: '$12.46M', change: '+12.3%', up: true },
          { label: 'YTD Revenue', value: '$98.2M', change: '+34.5%', up: true },
          { label: 'Creator Payouts', value: '$9.97M', change: '80% share', up: true },
          { label: 'Platform Fee', value: '$2.49M', change: '20% share', up: true },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
            <p className={cn('text-xs mt-1', s.up ? 'text-emerald-500' : 'text-red-500')}>{s.change}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
          <ChartPlaceholder icon={BarChart3} label="Revenue by category breakdown" />
        </Card>
        <Card padding="lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Transaction Volume</h3>
          <ChartPlaceholder icon={LineChart} label="Daily transaction volume" />
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Moderation Section                                                  */
/* ------------------------------------------------------------------ */

function ModerationSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Moderation Queue</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{MOCK_PENDING_TOOLS.length} items requiring review</p>
      </div>

      <div className="space-y-4">
        {MOCK_PENDING_TOOLS.map((tool) => (
          <Card key={tool.id} padding="none" className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="flex items-start gap-4 p-5 flex-1 min-w-0">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0',
                  tool.flagReason ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-100 dark:bg-gray-800'
                )}>
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                    {tool.flagReason && <Badge variant="error" size="sm"><Flag className="w-3 h-3 mr-1" />Flagged</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tool.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>by {tool.creatorName}</span>
                    <span>·</span>
                    <span>{tool.submittedAt}</span>
                    <span>·</span>
                    <span className="capitalize">{tool.category}</span>
                  </div>
                  {tool.flagReason && (
                    <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                      <p className="text-xs text-red-600 dark:text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{tool.flagReason}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tool.tags.map((tag) => <Badge key={tag} variant="default" size="sm">{tag}</Badge>)}
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center justify-end gap-2 p-4 sm:p-5 sm:border-l border-gray-100 dark:border-gray-800 sm:w-40">
                <Button size="sm" className="gap-1.5 w-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </Button>
                <Button variant="danger" size="sm" className="gap-1.5 w-full">
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 w-full">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comment
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Section                                                    */
/* ------------------------------------------------------------------ */

function SettingsSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Global configuration for the Toolverse platform</p>
      </div>
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">General</h3>
        <div className="space-y-4">
          <Input label="Platform Name" defaultValue="Toolverse" />
          <Input label="Support Email" defaultValue="support@toolverse.com" />
          <Input label="Max Upload Size (MB)" type="number" defaultValue="100" />
        </div>
      </Card>
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue</h3>
        <div className="space-y-4">
          <Input label="Platform Fee (%)" type="number" defaultValue="20" />
          <Input label="Payout Threshold (USD)" type="number" defaultValue="50" />
          <Input label="Payout Schedule" defaultValue="Bi-weekly" />
        </div>
      </Card>
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Security</h3>
        <div className="space-y-4">
          {[
            { label: 'Two-factor authentication required for admins', checked: true },
            { label: 'Auto-ban accounts with 3+ policy violations', checked: true },
            { label: 'Require email verification for new creators', checked: true },
            { label: 'Rate limit API to 1000 req/min per key', checked: false },
          ].map((setting) => (
            <label key={setting.label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={setting.checked} className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label}</span>
            </label>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button className="gap-2"><Settings className="w-4 h-4" />Save Settings</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Infrastructure Section                                              */
/* ------------------------------------------------------------------ */

function InfrastructureSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Server regions, services, and load balancing</p>
      </div>

      {/* Service Status */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Service Health</h3>
          <Badge variant="success" size="sm">All operational</Badge>
        </div>
        <div className="overflow-x-auto">
          <div className="divide-y divide-gray-100 dark:divide-gray-800 min-w-[480px]">
            {SYSTEM_SERVICES.map((svc) => {
              const colors = STATUS_COLORS[svc.status];
              return (
                <div key={svc.name} className="flex items-center gap-4 px-4 sm:px-5 py-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full', colors.bg)} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{svc.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums w-16 text-right">{svc.latency}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums w-16 text-right">{svc.uptime}</span>
                  <Badge variant={colors.badge} size="sm" className="w-20 justify-center capitalize">{svc.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Regions */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Server Regions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{REGIONS.length} active regions</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800">
          {REGIONS.map((region) => {
            const colors = STATUS_COLORS[region.status];
            return (
              <div key={region.name} className="p-4 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{region.name}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Load</span>
                      <span className={cn('font-medium', region.load > 80 ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300')}>{region.load}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', region.load > 80 ? 'bg-amber-500' : region.load > 60 ? 'bg-blue-500' : 'bg-emerald-500')}
                        style={{ width: `${region.load}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Instances</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{region.instances}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('w-1.5 h-1.5 rounded-full', colors.bg)} />
                    <span className={cn('text-xs capitalize', colors.text)}>{region.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Infra Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Instances', value: '260', icon: Cpu },
          { label: 'Storage Used', value: '847 TB', icon: HardDrive },
          { label: 'Bandwidth (24h)', value: '12.4 PB', icon: Wifi },
          { label: 'Avg Response', value: '23ms', icon: Zap },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared: Chart Placeholder                                           */
/* ------------------------------------------------------------------ */

function ChartPlaceholder({ icon: Icon, label, tall }: { icon: typeof BarChart3; label: string; tall?: boolean }) {
  return (
    <div className={cn(
      'rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700',
      tall ? 'h-80' : 'h-56'
    )}>
      <div className="text-center">
        <Icon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Integrate with Chart.js or Recharts</p>
      </div>
    </div>
  );
}
