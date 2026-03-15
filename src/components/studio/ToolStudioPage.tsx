'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
// Fallback mock data — replace with API fetch from /api/tools when available
import { communityTools, categories } from '@/lib/mock-data';
import type { Tool, ToolCategory } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import IntegrationGuide from '@/components/studio/IntegrationGuide';
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
  Image as ImageIcon,
  Tag,
  Settings,
  Code2,
  TrendingUp,
  Package,
  Eye,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Webhook,
  Key,
  Save,
  ExternalLink,
  Globe,
  Link,
  Shield,
  CreditCard,
  Percent,
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type StudioTab = 'tools' | 'sdk' | 'revenue' | 'settings';
type ToolStatus = 'published' | 'draft' | 'review';
type WizardStep = 1 | 2 | 3 | 4;

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

const STATUS_CONFIG: Record<ToolStatus, { labelKey: string; variant: 'success' | 'warning' | 'info' }> = {
  published: { labelKey: 'studio.status.published', variant: 'success' },
  draft: { labelKey: 'studio.status.draft', variant: 'warning' },
  review: { labelKey: 'studio.status.review', variant: 'info' },
};

const PRICING_TYPES = [
  { value: 'free', labelKey: 'studio.pricing.free', descKey: 'studio.pricing.freeDesc' },
  { value: 'freemium', labelKey: 'studio.pricing.freemium', descKey: 'studio.pricing.freemiumDesc' },
  { value: 'paid', labelKey: 'studio.pricing.paid', descKey: 'studio.pricing.paidDesc' },
  { value: 'subscription', labelKey: 'studio.pricing.subscription', descKey: 'studio.pricing.subscriptionDesc' },
] as const;

const AUTH_METHODS = [
  { value: 'toolverse', labelKey: 'studio.auth.toolverse', descKey: 'studio.auth.toolverseDesc', icon: Shield },
  { value: 'oauth', labelKey: 'studio.auth.oauth', descKey: 'studio.auth.oauthDesc', icon: Lock },
  { value: 'apikey', labelKey: 'studio.auth.apikey', descKey: 'studio.auth.apikeyDesc', icon: Key },
  { value: 'none', labelKey: 'studio.auth.none', descKey: 'studio.auth.noneDesc', icon: Globe },
] as const;

interface WizardFormData {
  // Step 1: Basic Info
  name: string;
  description: string;
  longDescription: string;
  category: ToolCategory | '';
  tags: string;
  // Step 2: Service Settings
  serviceUrl: string;
  apiEndpoint: string;
  authMethod: string;
  oauthClientId: string;
  oauthRedirectUri: string;
  webhookUrl: string;
  webhookEvents: string[];
  sandboxUrl: string;
  // Step 3: Pricing & Billing
  pricingType: 'free' | 'freemium' | 'paid' | 'subscription';
  monthlyPrice: string;
  yearlyPrice: string;
  freeTrialDays: string;
  freePlanLimits: string;
  stripeConnected: boolean;
  revenueShare: number;
  // Step 4: Review & Publish
  privacyPolicyUrl: string;
  termsUrl: string;
  supportEmail: string;
  supportUrl: string;
  visibility: 'public' | 'unlisted' | 'private';
}

const WIZARD_STEPS = [
  { step: 1 as WizardStep, titleKey: 'studio.wizard.step1', descKey: 'studio.wizard.step1Desc', icon: Package },
  { step: 2 as WizardStep, titleKey: 'studio.wizard.step2', descKey: 'studio.wizard.step2Desc', icon: Globe },
  { step: 3 as WizardStep, titleKey: 'studio.wizard.step3', descKey: 'studio.wizard.step3Desc', icon: CreditCard },
  { step: 4 as WizardStep, titleKey: 'studio.wizard.step4', descKey: 'studio.wizard.step4Desc', icon: CheckCircle2 },
];

export default function ToolStudioPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<StudioTab>('tools');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  // webhookUrl state removed — will be re-added when webhook settings UI is implemented

  const [formData, setFormData] = useState<WizardFormData>({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    tags: '',
    serviceUrl: '',
    apiEndpoint: '',
    authMethod: 'toolverse',
    oauthClientId: '',
    oauthRedirectUri: '',
    webhookUrl: '',
    webhookEvents: ['install', 'payment'],
    sandboxUrl: '',
    pricingType: 'free',
    monthlyPrice: '',
    yearlyPrice: '',
    freeTrialDays: '',
    freePlanLimits: '',
    stripeConnected: false,
    revenueShare: 70,
    privacyPolicyUrl: '',
    termsUrl: '',
    supportEmail: '',
    supportUrl: '',
    visibility: 'public',
  });

  const updateForm = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWebhookEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      webhookEvents: prev.webhookEvents.includes(event)
        ? prev.webhookEvents.filter((e) => e !== event)
        : [...prev.webhookEvents, event],
    }));
  };

  const copyCmd = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openWizard = () => {
    setWizardStep(1);
    setShowUploadModal(true);
  };

  const tabs: { id: StudioTab; labelKey: string; icon: typeof Package }[] = [
    { id: 'tools', labelKey: 'studio.tabs.tools', icon: Package },
    { id: 'sdk', labelKey: 'studio.tabs.sdk', icon: Code2 },
    { id: 'revenue', labelKey: 'studio.tabs.revenue', icon: DollarSign },
    { id: 'settings', labelKey: 'studio.tabs.settings', icon: Settings },
  ];

  const stats = [
    { labelKey: 'studio.stats.publishedTools', value: MOCK_STATS.publishedTools.toString(), icon: Package, gradient: 'from-violet-500 to-indigo-500' },
    { labelKey: 'studio.stats.totalUsers', value: formatNumber(MOCK_STATS.totalUsers), icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { labelKey: 'studio.stats.monthlyRevenue', value: formatCurrency(MOCK_STATS.monthlyRevenue), icon: DollarSign, gradient: 'from-emerald-500 to-green-500' },
    { labelKey: 'studio.stats.avgRating', value: `${MOCK_STATS.avgRating} ★`, icon: Star, gradient: 'from-amber-500 to-orange-500' },
  ];

  // ── Wizard Step Renderers ──

  const renderStep1 = () => (
    <div className="space-y-5">
      <Input
        label={`${t('studio.form.appName')} *`}
        placeholder="e.g. My Awesome App"
        value={formData.name}
        onChange={(e) => updateForm('name', e.target.value)}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.form.summaryDescription')} *</label>
        <textarea
          rows={2}
          placeholder={t('studio.form.summaryPlaceholder')}
          value={formData.description}
          onChange={(e) => updateForm('description', e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.form.detailedDescription')}</label>
        <textarea
          rows={4}
          placeholder={t('studio.form.detailedPlaceholder')}
          value={formData.longDescription}
          onChange={(e) => updateForm('longDescription', e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.form.category')} *</label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => updateForm('category', e.target.value as ToolCategory)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">{t('studio.form.categoryPlaceholder')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Input
          label={t('studio.form.tags')}
          placeholder={t('studio.form.tagsPlaceholder')}
          value={formData.tags}
          onChange={(e) => updateForm('tags', e.target.value)}
          icon={<Tag className="w-4 h-4" />}
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.form.icon')}</label>
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
            <ImageIcon className="w-7 h-7 text-violet-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('studio.form.iconDragDrop')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('studio.form.iconHint')}</p>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.form.screenshots')}</label>
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
            <Upload className="w-7 h-7 text-indigo-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('studio.form.screenshotsDesc')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('studio.form.screenshotsHint')}</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('studio.webAppConnection')}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t('studio.webAppConnectionDesc')}
            </p>
          </div>
        </div>
      </div>

      <Input
        label={`${t('studio.form.serviceUrl')} *`}
        placeholder="https://your-app.com"
        value={formData.serviceUrl}
        onChange={(e) => updateForm('serviceUrl', e.target.value)}
        icon={<Link className="w-4 h-4" />}
      />

      <Input
        label={t('studio.form.sandboxUrl')}
        placeholder="https://demo.your-app.com"
        value={formData.sandboxUrl}
        onChange={(e) => updateForm('sandboxUrl', e.target.value)}
        icon={<Globe className="w-4 h-4" />}
      />

      <Input
        label={t('studio.form.apiEndpoint')}
        placeholder="https://api.your-app.com/v1"
        value={formData.apiEndpoint}
        onChange={(e) => updateForm('apiEndpoint', e.target.value)}
        icon={<Code2 className="w-4 h-4" />}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('studio.auth.title')} *</label>
        <div className="space-y-2">
          {AUTH_METHODS.map((method) => (
            <button
              key={method.value}
              onClick={() => updateForm('authMethod', method.value)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                formData.authMethod === method.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                formData.authMethod === method.value
                  ? 'bg-violet-100 dark:bg-violet-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <method.icon className={cn('w-5 h-5', formData.authMethod === method.value ? 'text-violet-600' : 'text-gray-500')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', formData.authMethod === method.value ? 'text-violet-700 dark:text-violet-300' : 'text-gray-900 dark:text-white')}>
                  {t(method.labelKey)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t(method.descKey)}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                formData.authMethod === method.value ? 'border-violet-500 bg-violet-500' : 'border-gray-300 dark:border-gray-600'
              )}>
                {formData.authMethod === method.value && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {formData.authMethod === 'oauth' && (
        <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('studio.auth.oauthSettings')}</p>
          <Input
            label="Client ID"
            placeholder="your-oauth-client-id"
            value={formData.oauthClientId}
            onChange={(e) => updateForm('oauthClientId', e.target.value)}
          />
          <Input
            label="Redirect URI"
            placeholder="https://your-app.com/callback"
            value={formData.oauthRedirectUri}
            onChange={(e) => updateForm('oauthRedirectUri', e.target.value)}
          />
        </div>
      )}

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.form.webhookUrl')}</label>
        <Input
          placeholder="https://your-server.com/webhook/toolverse"
          value={formData.webhookUrl}
          onChange={(e) => updateForm('webhookUrl', e.target.value)}
          icon={<Webhook className="w-4 h-4" />}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {['install', 'uninstall', 'payment', 'review', 'subscription.created', 'subscription.cancelled'].map((event) => (
            <button
              key={event}
              onClick={() => toggleWebhookEvent(event)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                formData.webhookEvents.includes(event)
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              )}
            >
              {event}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('studio.pricing.title')} *</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {PRICING_TYPES.map((pt) => (
            <button
              key={pt.value}
              onClick={() => updateForm('pricingType', pt.value)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                formData.pricingType === pt.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <p className={cn('text-sm font-semibold', formData.pricingType === pt.value ? 'text-violet-700 dark:text-violet-300' : 'text-gray-900 dark:text-white')}>
                {t(pt.labelKey)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(pt.descKey)}</p>
            </button>
          ))}
        </div>
      </div>

      {(formData.pricingType === 'subscription' || formData.pricingType === 'freemium') && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label={t('studio.pricing.monthlyPrice')}
            type="number"
            placeholder="980"
            value={formData.monthlyPrice}
            onChange={(e) => updateForm('monthlyPrice', e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <Input
            label={t('studio.pricing.yearlyPrice')}
            type="number"
            placeholder="9800"
            value={formData.yearlyPrice}
            onChange={(e) => updateForm('yearlyPrice', e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>
      )}

      {formData.pricingType === 'paid' && (
        <Input
          label={t('studio.pricing.salePrice')}
          type="number"
          placeholder="4980"
          value={formData.monthlyPrice}
          onChange={(e) => updateForm('monthlyPrice', e.target.value)}
          icon={<DollarSign className="w-4 h-4" />}
        />
      )}

      {(formData.pricingType === 'subscription' || formData.pricingType === 'paid') && (
        <Input
          label={t('studio.pricing.freeTrialDays')}
          type="number"
          placeholder="14"
          value={formData.freeTrialDays}
          onChange={(e) => updateForm('freeTrialDays', e.target.value)}
          icon={<Clock className="w-4 h-4" />}
        />
      )}

      {formData.pricingType === 'freemium' && (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.pricing.freePlanLimits')}</label>
          <textarea
            rows={3}
            placeholder={t('studio.pricing.freePlanLimitsPlaceholder')}
            value={formData.freePlanLimits}
            onChange={(e) => updateForm('freePlanLimits', e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
          />
        </div>
      )}

      {/* Toolverse Payment Connection */}
      {formData.pricingType !== 'free' && (
        <div className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('studio.payment.title')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('studio.payment.description')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                formData.stripeConnected ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
              )}>
                {formData.stripeConnected
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  : <AlertCircle className="w-5 h-5 text-amber-600" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.stripeConnected ? t('studio.payment.connected') : t('studio.payment.notConnected')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.stripeConnected ? t('studio.payment.connectedVia') : t('studio.payment.notConnectedDesc')}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={formData.stripeConnected ? 'outline' : 'primary'}
              onClick={() => updateForm('stripeConnected', !formData.stripeConnected)}
              className="shrink-0"
            >
              {formData.stripeConnected ? t('studio.payment.changeSettings') : t('studio.payment.connect')}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('studio.payment.revenueShare')}</p>
              <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{t('studio.payment.creatorShare')} {formData.revenueShare}% / Toolverse {100 - formData.revenueShare}%</p>
            </div>
            <div className="flex items-center gap-3">
              <Percent className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="range"
                min={50}
                max={90}
                step={5}
                value={formData.revenueShare}
                onChange={(e) => updateForm('revenueShare', Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-violet-600"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('studio.payment.platformFee')}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
        <p className="text-sm font-medium text-violet-800 dark:text-violet-300">{t('studio.review.title')}</p>
        <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
          {t('studio.review.description')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label={`${t('studio.form.privacyPolicyUrl')} *`}
          placeholder="https://your-app.com/privacy"
          value={formData.privacyPolicyUrl}
          onChange={(e) => updateForm('privacyPolicyUrl', e.target.value)}
          icon={<Shield className="w-4 h-4" />}
        />
        <Input
          label={`${t('studio.form.termsUrl')} *`}
          placeholder="https://your-app.com/terms"
          value={formData.termsUrl}
          onChange={(e) => updateForm('termsUrl', e.target.value)}
          icon={<FileText className="w-4 h-4" />}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label={`${t('studio.form.supportEmail')} *`}
          placeholder="support@your-app.com"
          value={formData.supportEmail}
          onChange={(e) => updateForm('supportEmail', e.target.value)}
        />
        <Input
          label={t('studio.form.supportUrl')}
          placeholder="https://your-app.com/support"
          value={formData.supportUrl}
          onChange={(e) => updateForm('supportUrl', e.target.value)}
          icon={<ExternalLink className="w-4 h-4" />}
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('studio.review.visibility')}</label>
        <div className="space-y-2">
          {[
            { value: 'public', labelKey: 'studio.review.public', descKey: 'studio.review.publicDesc', icon: Globe },
            { value: 'unlisted', labelKey: 'studio.review.unlisted', descKey: 'studio.review.unlistedDesc', icon: Link },
            { value: 'private', labelKey: 'studio.review.private', descKey: 'studio.review.privateDesc', icon: Lock },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateForm('visibility', opt.value as 'public' | 'unlisted' | 'private')}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                formData.visibility === opt.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <opt.icon className={cn('w-5 h-5 shrink-0', formData.visibility === opt.value ? 'text-violet-600' : 'text-gray-400')} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', formData.visibility === opt.value ? 'text-violet-700 dark:text-violet-300' : 'text-gray-900 dark:text-white')}>
                  {t(opt.labelKey)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t(opt.descKey)}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                formData.visibility === opt.value ? 'border-violet-500 bg-violet-500' : 'border-gray-300 dark:border-gray-600'
              )}>
                {formData.visibility === opt.value && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('studio.review.summary')}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('studio.review.appName')}</p>
            <p className="font-medium text-gray-900 dark:text-white">{formData.name || t('studio.review.notEntered')}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('studio.form.category')}</p>
            <p className="font-medium text-gray-900 dark:text-white">{formData.category || t('studio.review.notSelected')}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('studio.form.serviceUrl')}</p>
            <p className="font-medium text-gray-900 dark:text-white truncate">{formData.serviceUrl || t('studio.review.notEntered')}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('studio.review.authMethod')}</p>
            <p className="font-medium text-gray-900 dark:text-white">{t(AUTH_METHODS.find((m) => m.value === formData.authMethod)?.labelKey ?? '')}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('studio.review.pricingModel')}</p>
            <p className="font-medium text-gray-900 dark:text-white">{t(PRICING_TYPES.find((p) => p.value === formData.pricingType)?.labelKey ?? '')}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('studio.review.visibility')}</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {t(`studio.review.${formData.visibility}`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (wizardStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
    }
  };

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
              {t('studio.subtitle')}
            </p>
          </div>
          <Button size="lg" className="gap-2 shrink-0" onClick={openWizard}>
            <Plus className="w-5 h-5" />
            {t('studio.registerNew')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.labelKey} padding="md" className="overflow-hidden relative">
              <div className={cn('absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 bg-gradient-to-br opacity-15', stat.gradient)} />
              <div className="relative">
                <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center mb-3', stat.gradient)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t(stat.labelKey)}</p>
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
              {t(tab.labelKey)}
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
                          <Badge variant={statusInfo.variant} size="sm">{t(statusInfo.labelKey)}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{tool.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{formatNumber(tool.userCount)}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatNumber(tool.views)}</span>
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{tool.rating}</span>
                          {tool.monthlyRevenue > 0 && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <TrendingUp className="w-3.5 h-3.5" />{formatCurrency(tool.monthlyRevenue)}{t('studio.actions.perMonth')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 pb-4 sm:p-5 sm:border-l border-gray-100 dark:border-gray-800">
                      <Button variant="outline" size="sm" className="gap-1.5"><Edit className="w-3.5 h-3.5" />{t('studio.actions.edit')}</Button>
                      <Button variant="ghost" size="sm" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" />{t('studio.actions.analytics')}</Button>
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
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('studio.sdk.quickStart')}</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t('studio.sdk.quickStartDesc')}
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('studio.sdk.install')}</p>
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm overflow-x-auto pr-12">{SDK_INSTALL}</pre>
                      <button onClick={() => copyCmd(SDK_INSTALL, 'install')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                        {copiedId === 'install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('studio.sdk.example')}</p>
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs overflow-x-auto max-h-64 overflow-y-auto leading-relaxed pr-12">{SDK_SNIPPET}</pre>
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
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('studio.sdk.resources')}</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { labelKey: 'studio.sdk.apiReference', descKey: 'studio.sdk.apiReferenceDesc', icon: Code2 },
                    { labelKey: 'studio.sdk.authGuide', descKey: 'studio.sdk.authGuideDesc', icon: Key },
                    { labelKey: 'studio.sdk.webhook', descKey: 'studio.sdk.webhookDesc', icon: Webhook },
                    { labelKey: 'studio.sdk.rateLimit', descKey: 'studio.sdk.rateLimitDesc', icon: Clock },
                  ].map((item) => (
                    <button key={item.labelKey} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{t(item.labelKey)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t(item.descKey)}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="outline" fullWidth className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('studio.sdk.openDocs')}
                  </Button>
                </div>
              </Card>
            </div>
            <IntegrationGuide />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { labelKey: 'studio.revenue.lifetimeEarnings', value: formatCurrency(842000), change: '+12.3%', up: true },
                { labelKey: 'studio.revenue.thisMonth', value: formatCurrency(84200), change: '+8.7%', up: true },
                { labelKey: 'studio.revenue.nextPayout', value: formatCurrency(42100), change: '3月15日', up: false },
              ].map((s) => (
                <Card key={s.labelKey} padding="lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(s.labelKey)}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
                  <p className={cn('text-xs mt-1', s.up ? 'text-emerald-500' : 'text-gray-400')}>{s.change}</p>
                </Card>
              ))}
            </div>
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('studio.revenue.chart')}</h2>
              <div className="h-72 rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t('studio.revenue.chartPlaceholder')}</p>
                </div>
              </div>
            </Card>
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('studio.revenue.byTool')}</h2>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('studio.settings.creatorProfile')}</h2>
              <div className="space-y-4">
                <Input label={t('studio.settings.displayName')} defaultValue="AI Labs" />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('studio.settings.bio')}</label>
                  <textarea
                    rows={3}
                    defaultValue=""
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <Input label={t('studio.settings.website')} defaultValue="https://ailabs.example.com" />
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2"><Save className="w-4 h-4" />{t('studio.settings.saveProfile')}</Button>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('studio.settings.apiKey')}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('studio.settings.apiKeyDesc')}
              </p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('studio.settings.productionKey')}</p>
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
                <Button variant="danger" size="sm" className="gap-2">{t('studio.settings.regenerateKey')}</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Wizard Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('studio.wizard.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('studio.wizard.subtitle')}</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-5 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((step, i) => (
                  <div key={step.step} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => setWizardStep(step.step)}
                      className="flex items-center gap-2 min-w-0"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all',
                        wizardStep === step.step
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                          : wizardStep > step.step
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      )}>
                        {wizardStep > step.step ? <Check className="w-4 h-4" /> : step.step}
                      </div>
                      <div className="hidden sm:block min-w-0">
                        <p className={cn(
                          'text-xs font-medium truncate',
                          wizardStep === step.step ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'
                        )}>
                          {t(step.titleKey)}
                        </p>
                      </div>
                    </button>
                    {i < WIZARD_STEPS.length - 1 && (
                      <div className={cn(
                        'flex-1 h-0.5 mx-2 rounded-full',
                        wizardStep > step.step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-4 overflow-y-auto flex-1">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                {wizardStep > 1 && (
                  <Button variant="ghost" onClick={() => setWizardStep((wizardStep - 1) as WizardStep)} className="gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    {t('studio.wizard.previous')}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => setShowUploadModal(false)}>{t('common.cancel')}</Button>
                {wizardStep < 4 ? (
                  <Button onClick={() => setWizardStep((wizardStep + 1) as WizardStep)} className="gap-1">
                    {t('studio.wizard.next')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      {t('studio.wizard.saveDraft')}
                    </Button>
                    <Button className="gap-2">
                      <Upload className="w-4 h-4" />
                      {t('studio.wizard.submitReview')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
