'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
import { communityTools, categories } from '@/lib/mock-data';
import type { Tool, ToolCategory } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import {
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Users,
  DollarSign,
  Star,
  Upload,
  X,
  Terminal,
  Copy,
  Check,
  Image,
  Tag,
  Settings,
  Code2,
  TrendingUp,
  Package,
  Eye,
  Clock,
  FileText,
  ChevronDown,
  Sparkles,
  Webhook,
  Key,
  Save,
  ExternalLink,
} from 'lucide-react';

type StudioTab = 'tools' | 'sdk' | 'revenue' | 'settings';

type ToolStatus = 'published' | 'draft' | 'review';

interface MyTool extends Tool {
  status: ToolStatus;
  monthlyRevenue: number;
  views: number;
}

const MOCK_MY_TOOLS: MyTool[] = communityTools.slice(0, 5).map((tool, i) => ({
  ...tool,
  status: (['published', 'published', 'draft', 'review', 'published'] as ToolStatus[])[i],
  monthlyRevenue: [48500, 23400, 0, 0, 12300][i],
  views: [12400, 8700, 320, 1500, 5600][i],
}));

const MOCK_STATS = {
  publishedTools: 3,
  totalUsers: 74600,
  monthlyRevenue: 84200,
  avgRating: 4.5,
};

const SDK_INSTALL = 'npm install @toolverse/sdk';
const SDK_SNIPPET = `import { ToolverseSDK } from '@toolverse/sdk';

const sdk = new ToolverseSDK({
  apiKey: process.env.TOOLVERSE_API_KEY,
  toolId: 'your-tool-id',
});

// Register a tool action
sdk.registerAction('analyze', async (input) => {
  const result = await yourLogic(input);
  return { success: true, data: result };
});

// Start listening
sdk.listen({ port: 3001 });`;

const STATUS_CONFIG: Record<ToolStatus, { label: string; variant: 'success' | 'warning' | 'info' }> = {
  published: { label: 'Published', variant: 'success' },
  draft: { label: 'Draft', variant: 'warning' },
  review: { label: 'Under Review', variant: 'info' },
};

const PRICING_TYPES = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid (One-time)' },
  { value: 'subscription', label: 'Subscription' },
] as const;

export default function ToolStudioPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<StudioTab>('tools');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ToolCategory | '',
    pricingType: 'free' as 'free' | 'freemium' | 'paid' | 'subscription',
    price: '',
    tags: '',
  });
  const [webhookUrl, setWebhookUrl] = useState('https://');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const copyCmd = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs: { id: StudioTab; label: string; icon: typeof Package }[] = [
    { id: 'tools', label: 'My Tools', icon: Package },
    { id: 'sdk', label: 'SDK Integration', icon: Code2 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Published Tools', value: MOCK_STATS.publishedTools.toString(), icon: Package, gradient: 'from-violet-500 to-indigo-500' },
    { label: 'Total Users', value: formatNumber(MOCK_STATS.totalUsers), icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Monthly Revenue', value: formatCurrency(MOCK_STATS.monthlyRevenue), icon: DollarSign, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Avg Rating', value: `${MOCK_STATS.avgRating} ★`, icon: Star, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Tool Studio
                </span>
              </h1>
            </div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Build, publish, and manage your tools on Toolverse.
            </p>
          </div>
          <Button size="lg" className="gap-2 shrink-0" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-5 h-5" />
            Upload New Tool
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} padding="md" className="overflow-hidden relative">
              <div className={cn('absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 bg-gradient-to-br opacity-15', stat.gradient)} />
              <div className="relative">
                <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center mb-3', stat.gradient)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {MOCK_MY_TOOLS.map((tool) => {
              const statusInfo = STATUS_CONFIG[tool.status];
              return (
                <Card key={tool.id} padding="none" className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex items-center gap-4 p-4 sm:p-5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0">
                        {tool.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{tool.name}</h3>
                          <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{tool.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{formatNumber(tool.userCount)}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatNumber(tool.views)}</span>
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{tool.rating}</span>
                          {tool.monthlyRevenue > 0 && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <TrendingUp className="w-3.5 h-3.5" />{formatCurrency(tool.monthlyRevenue)}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 pb-4 sm:p-5 sm:border-l border-gray-100 dark:border-gray-800">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Analytics
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'sdk' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Start</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Install the Toolverse SDK to integrate your tool with the platform.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Install</p>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm overflow-x-auto pr-12">
                      {SDK_INSTALL}
                    </pre>
                    <button onClick={() => copyCmd(SDK_INSTALL, 'install')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                      {copiedId === 'install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Integration Example</p>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs overflow-x-auto max-h-64 overflow-y-auto leading-relaxed pr-12">
                      {SDK_SNIPPET}
                    </pre>
                    <button onClick={() => copyCmd(SDK_SNIPPET, 'snippet')} className="absolute right-3 top-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                      {copiedId === 'snippet' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'API Reference', desc: 'Complete SDK documentation', icon: Code2 },
                  { label: 'Authentication Guide', desc: 'OAuth2 and API key setup', icon: Key },
                  { label: 'Webhooks', desc: 'Real-time event notifications', icon: Webhook },
                  { label: 'Rate Limits', desc: 'Usage quotas and throttling', icon: Clock },
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" fullWidth className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Full Documentation
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Earnings', value: formatCurrency(842000), change: '+12.3%', up: true },
                { label: 'This Month', value: formatCurrency(84200), change: '+8.7%', up: true },
                { label: 'Pending Payout', value: formatCurrency(42100), change: 'Next: Mar 15', up: false },
              ].map((s) => (
                <Card key={s.label} padding="lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
                  <p className={cn('text-xs mt-1', s.up ? 'text-emerald-500' : 'text-gray-400')}>{s.change}</p>
                </Card>
              ))}
            </div>
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Over Time</h2>
              <div className="h-72 rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">Revenue chart visualization</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Integrate with Chart.js or Recharts</p>
                </div>
              </div>
            </Card>
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Tool</h2>
              <div className="space-y-3">
                {MOCK_MY_TOOLS.filter((t) => t.monthlyRevenue > 0).map((tool) => (
                  <div key={tool.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0">{tool.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tool.name}</p>
                      <div className="mt-1.5 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: `${(tool.monthlyRevenue / MOCK_STATS.monthlyRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">{formatCurrency(tool.monthlyRevenue)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Creator Profile</h2>
              <div className="space-y-4">
                <Input label="Display Name" defaultValue="AI Labs" />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    defaultValue="Building next-generation AI tools for professionals."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <Input label="Website" defaultValue="https://ailabs.example.com" />
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2"><Save className="w-4 h-4" />Save Profile</Button>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Webhook className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Configuration</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Receive real-time notifications for installs, uninstalls, reviews, and payments.
              </p>
              <div className="space-y-3">
                <Input
                  label="Webhook URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                />
                <div className="flex flex-wrap gap-2">
                  {['install', 'uninstall', 'review', 'payment'].map((event) => (
                    <label key={event} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="gap-2"><Save className="w-4 h-4" />Save Webhook</Button>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Manage your API keys for SDK integration and tool management.
              </p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Production Key</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                      {apiKeyVisible ? 'tv_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' : 'tv_prod_••••••••••••••••••••••••••'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setApiKeyVisible(!apiKeyVisible)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyCmd('tv_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'apikey')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="danger" size="sm" className="gap-2">Regenerate Key</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload New Tool</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details to publish your tool.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <Input
                label="Tool Name"
                placeholder="My Awesome Tool"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what your tool does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ToolCategory })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pricing Model</label>
                  <div className="relative">
                    <select
                      value={formData.pricingType}
                      onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as typeof formData.pricingType })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
                    >
                      {PRICING_TYPES.map((pt) => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {(formData.pricingType === 'paid' || formData.pricingType === 'subscription') && (
                <Input
                  label={formData.pricingType === 'subscription' ? 'Monthly Price (JPY)' : 'Price (JPY)'}
                  type="number"
                  placeholder="980"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  icon={<DollarSign className="w-4 h-4" />}
                />
              )}

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors cursor-pointer">
                  <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                    <Image className="w-7 h-7 text-violet-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drop icon here or click to upload</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, SVG up to 512x512</p>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Screenshots</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors cursor-pointer">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload screenshots (up to 6)</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG — 1280x720 recommended</p>
                </div>
              </div>

              <Input
                label="Tags"
                placeholder="AI, Productivity, Writing (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                icon={<Tag className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl shrink-0">
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" />Save as Draft</Button>
              <Button className="gap-2"><Upload className="w-4 h-4" />Publish Tool</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
