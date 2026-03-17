'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Check,
  Zap,
  Users,
  Building2,
  Crown,
  CreditCard,
  Receipt,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  ArrowRight,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { getStripe } from '@/lib/stripe-client';
import type { Invoice, PaymentMethod } from '@/lib/payments';

const PLANS = [
  {
    id: 'free',
    icon: Zap,
    nameKey: 'billing.plans.free.name',
    priceKey: 'billing.plans.free.price',
    periodKey: null,
    descriptionKey: 'billing.plans.free.description',
    priceValue: 0,
    stripePriceId: null as string | null,
    stripeYearlyPriceId: null as string | null,
    features: [
      '5 ツール',
      '1 GB ストレージ',
      'コミュニティサポート',
      '基本分析',
    ],
    current: true,
    highlight: false,
  },
  {
    id: 'pro',
    icon: Crown,
    nameKey: 'billing.plans.pro.name',
    priceKey: 'billing.plans.pro.price',
    periodKey: 'billing.plans.pro.period',
    descriptionKey: 'billing.plans.pro.description',
    priceValue: 1980,
    stripePriceId: (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1TBl3TRobU1ygm39tzorv9cL').trim(),
    stripeYearlyPriceId: (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_1TBl3TRobU1ygm39Cqn8u0mn').trim(),
    features: [
      'ツール数無制限',
      '10 GB ストレージ',
      '優先サポート',
      '高度な分析',
      'API アクセス',
      '90% レベニューシェア',
    ],
    current: false,
    highlight: true,
  },
  {
    id: 'team',
    icon: Users,
    nameKey: 'billing.plans.team.name',
    priceKey: 'billing.plans.team.price',
    periodKey: 'billing.plans.team.period',
    descriptionKey: 'billing.plans.team.description',
    priceValue: 4980,
    stripePriceId: (process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY || 'price_1TBl3URobU1ygm396Z0TIYgf').trim(),
    stripeYearlyPriceId: (process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY || 'price_1TBl3URobU1ygm39N0SJvGu8').trim(),
    features: [
      'プロの全機能を含む',
      'チームコラボレーション',
      '50 GB ストレージ',
      'SSO / SAML',
      '専任サポート',
      'カスタムドメイン',
    ],
    current: false,
    highlight: false,
  },
  {
    id: 'enterprise',
    icon: Building2,
    nameKey: 'billing.plans.enterprise.name',
    priceKey: 'billing.plans.enterprise.price',
    periodKey: null,
    descriptionKey: 'billing.plans.enterprise.description',
    priceValue: -1,
    stripePriceId: null as string | null,
    stripeYearlyPriceId: null as string | null,
    features: [
      'カスタム制限',
      'SLA 保証',
      'オンプレミスオプション',
      'カスタム統合',
      '専任アカウントマネージャー',
      '監査ログ',
    ],
    current: false,
    highlight: false,
  },
];

const STATIC_USAGE_STATS = [
  { label: 'ツール使用数', value: '5', limit: '5', unit: 'tools', percent: 100 },
  { label: 'ストレージ', value: '0.8', limit: '1', unit: 'GB', percent: 80 },
  { label: 'API コール数', value: '1,240', limit: '10,000', unit: 'calls', percent: 12.4 },
  { label: '帯域幅', value: '3.2', limit: '10', unit: 'GB', percent: 32 },
];

type BillingTab = 'plans' | 'payment' | 'history' | 'revenue';

const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  jcb: 'JCB',
  diners: 'Diners Club',
};

interface MAUStats {
  monthKey: string;
  activeUsers: number;
  limit: number | null;
  limitReached: boolean;
  percentUsed: number;
  byTool: { toolId: string; toolName: string; activeUsers: number }[];
}

export default function BillingPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<BillingTab>('plans');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [mauStats, setMauStats] = useState<MAUStats | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const [showAddCard, setShowAddCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'history' && invoices.length === 0) {
      let cancelled = false;
      const fetchInvoices = async () => {
        try {
          const res = await fetch('/api/billing/invoices');
          if (res.ok && !cancelled) {
            const data = await res.json();
            setInvoices(data.invoices ?? []);
          }
        } catch {
          // ignore
        } finally {
          if (!cancelled) setLoadingInvoices(false);
        }
      };
      fetchInvoices();
      return () => { cancelled = true; };
    }
    if (activeTab === 'payment' && paymentMethods.length === 0) {
      let cancelled = false;
      const fetchMethods = async () => {
        try {
          const res = await fetch('/api/billing/payment-methods');
          if (res.ok && !cancelled) {
            const data = await res.json();
            setPaymentMethods(data.methods ?? data.paymentMethods ?? []);
          }
        } catch {
          // ignore
        } finally {
          if (!cancelled) setLoadingMethods(false);
        }
      };
      fetchMethods();
      return () => { cancelled = true; };
    }
  }, [activeTab, invoices.length, paymentMethods.length]);

  useEffect(() => {
    let cancelled = false;
    const fetchMAU = async () => {
      try {
        const res = await fetch('/api/creator/active-users');
        if (res.ok && !cancelled) {
          setMauStats(await res.json());
        }
      } catch {
        // silently ignore — non-creator users won't have access
      }
    };
    fetchMAU();
    return () => { cancelled = true; };
  }, []);

  const USAGE_STATS = useMemo(() => {
    const stats = [...STATIC_USAGE_STATS];
    if (mauStats) {
      const mauPercent =
        mauStats.limit !== null
          ? (mauStats.activeUsers / mauStats.limit) * 100
          : 0;
      stats.unshift({
        label: t('billing.activeUsers') || 'アクティブユーザー',
        value: mauStats.activeUsers.toLocaleString(),
        limit: mauStats.limit !== null ? mauStats.limit.toLocaleString() : '∞',
        unit: 'users',
        percent: Math.round(mauPercent * 10) / 10,
      });
    }
    return stats;
  }, [mauStats, t]);

  const handleAddCard = useCallback(async () => {
    setAddingCard(true);
    setCardError(null);
    try {
      const stripeJs = await getStripe();
      if (!stripeJs) {
        setCardError('Stripe の初期化に失敗しました。ページを再読み込みしてください。');
        return;
      }

      // Create a SetupIntent on the server to securely collect card details
      const setupRes = await fetch('/api/billing/setup-intent', { method: 'POST' });
      if (!setupRes.ok) {
        const err = await setupRes.json().catch(() => ({}));
        setCardError(err.error || 'セットアップの作成に失敗しました。');
        return;
      }
      const { clientSecret, customerId } = await setupRes.json();

      // Use Stripe's secure card collection via redirect
      const { error } = await stripeJs.confirmCardSetup(clientSecret, {
        payment_method: {
          card: { token: '' } as never, // Will be replaced by redirect
        },
      });

      // If Stripe.js card element is not mounted, redirect to Stripe Checkout for setup
      if (error) {
        // Fallback: use Checkout in setup mode
        const checkoutRes = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'setup',
            successUrl: '/billing?tab=payment&cardAdded=true',
            cancelUrl: '/billing?tab=payment',
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        setCardError(error.message || 'カード登録に失敗しました。');
      }
    } catch {
      setCardError('カード登録中にエラーが発生しました。');
    } finally {
      setAddingCard(false);
    }
  }, []);

  const tabs: { id: BillingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'plans', label: t('billing.subscription'), icon: <Crown className="w-4 h-4" /> },
    { id: 'payment', label: t('billing.paymentMethods') || 'お支払い方法', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'history', label: t('billing.billingHistory') || '請求履歴', icon: <Receipt className="w-4 h-4" /> },
    { id: 'revenue', label: t('billing.revenueShare'), icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('billing.title')}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            サブスクリプション、お支払い方法、請求履歴を管理できます。
          </p>
        </div>

        {/* Current Plan Banner */}
        <Card
          padding="lg"
          className="mb-8 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-900/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('billing.currentPlan')}
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('billing.plans.free.name')}
                </h2>
                <Badge variant="gradient" size="sm">有効</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('billing.plans.free.description')}
              </p>
            </div>
            <Button className="relative z-10" onClick={() => setActiveTab('plans')}>{t('billing.upgrade')}</Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Usage Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('billing.usage')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {USAGE_STATS.map((stat) => (
                  <Card key={stat.label} padding="md">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {' '}/ {stat.limit} {stat.unit}
                      </span>
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          stat.percent >= 90
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : stat.percent >= 60
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                              : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                        )}
                        style={{ width: `${Math.min(100, stat.percent)}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Plan Comparison */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('billing.subscription')}
                </h2>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-sm font-medium',
                    !isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  )}>
                    月払い
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isYearly}
                    onClick={() => setIsYearly(!isYearly)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isYearly ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  >
                    <span className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                      isYearly ? 'translate-x-6' : 'translate-x-1'
                    )} />
                  </button>
                  <span className={cn(
                    'text-sm font-medium',
                    isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  )}>
                    年払い
                  </span>
                  {isYearly && (
                    <Badge variant="success" size="sm">2ヶ月分お得</Badge>
                  )}
                </div>
              </div>
              {upgradeError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {upgradeError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                  <Card
                    key={plan.id}
                    padding="lg"
                    className={cn(
                      'relative flex flex-col',
                      plan.highlight &&
                        'ring-2 ring-violet-500 shadow-xl shadow-violet-500/20 dark:shadow-violet-500/10'
                    )}
                  >
                    {plan.current && (
                      <Badge
                        variant="gradient"
                        size="sm"
                        className="absolute top-4 right-4"
                      >
                        現在
                      </Badge>
                    )}
                    {plan.highlight && !plan.current && (
                      <Badge
                        variant="info"
                        size="sm"
                        className="absolute top-4 right-4"
                      >
                        {t('common.popular')}
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          plan.highlight
                            ? 'bg-violet-100 dark:bg-violet-900/40'
                            : 'bg-gray-100 dark:bg-gray-800'
                        )}
                      >
                        <plan.icon
                          className={cn(
                            'w-6 h-6',
                            plan.highlight
                              ? 'text-violet-600 dark:text-violet-400'
                              : 'text-gray-600 dark:text-gray-400'
                          )}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {t(plan.nameKey)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(plan.descriptionKey)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-6 whitespace-nowrap">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t(plan.priceKey)}
                      </span>
                      {plan.periodKey && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {t(plan.periodKey)}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.highlight ? 'primary' : 'outline'}
                      fullWidth
                      disabled={plan.current || plan.id === 'enterprise' || upgradingPlanId === plan.id}
                      isLoading={upgradingPlanId === plan.id}
                      onClick={async () => {
                        if (plan.id === 'enterprise' || plan.current) return;
                        const priceId = isYearly
                          ? plan.stripeYearlyPriceId
                          : plan.stripePriceId;
                        if (!priceId) {
                          setUpgradeError('このプランの Price ID が設定されていません。');
                          return;
                        }
                        setUpgradingPlanId(plan.id);
                        setUpgradeError(null);
                        try {
                          const res = await fetch('/api/billing/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              planId: plan.id,
                              priceId,
                              successUrl: '/billing?success=true',
                              cancelUrl: '/billing',
                            }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            setUpgradeError(data.error || 'チェックアウトの作成に失敗しました。');
                          }
                        } catch {
                          setUpgradeError('ネットワークエラーが発生しました。もう一度お試しください。');
                        } finally {
                          setUpgradingPlanId(null);
                        }
                      }}
                    >
                      {plan.current
                        ? t('billing.currentPlan')
                        : plan.id === 'enterprise'
                          ? 'お問い合わせ'
                          : t('billing.upgrade')}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                お支払い方法
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddCard(!showAddCard)}
              >
                <Plus className="w-4 h-4 mr-1" />
                カードを追加
              </Button>
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <Card padding="lg" className="border-violet-200 dark:border-violet-900/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  お支払い方法を追加
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stripeの安全な画面でカード情報を入力できます。カード情報は当サイトのサーバーに保存されません。
                  </p>
                  {cardError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {cardError}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <Shield className="w-3.5 h-3.5" />
                    決済はStripeにより安全に処理されます（PCI DSS準拠）。
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddCard} isLoading={addingCard} disabled={addingCard}>
                      Stripeでカードを登録
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowAddCard(false); setCardError(null); }}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Existing cards */}
            {loadingMethods ? (
              <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
            ) : paymentMethods.length === 0 ? (
              <Card padding="lg" className="text-center">
                <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">お支払い方法が登録されていません。</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  プランに登録するにはカードを追加してください。
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <Card key={pm.id} padding="md" className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {pm.card ? CARD_BRANDS[pm.card.brand] || pm.card.brand : pm.type} ••••{' '}
                          {pm.card?.last4}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          有効期限 {pm.card?.expMonth}/{pm.card?.expYear}
                        </p>
                      </div>
                      {pm.isDefault && (
                        <Badge variant="success" size="sm">デフォルト</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={async () => {
                        try {
                          await fetch(`/api/billing/payment-methods?id=${pm.id}`, {
                            method: 'DELETE',
                          });
                          setPaymentMethods((prev) => prev.filter((p) => p.id !== pm.id));
                        } catch {
                          // handle error
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              請求履歴
            </h2>
            {loadingInvoices ? (
              <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
            ) : invoices.length === 0 ? (
              <Card padding="lg" className="text-center">
                <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">請求履歴はまだありません。</p>
              </Card>
            ) : (
              <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          請求番号
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          説明
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          金額
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          ステータス
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          日付
                        </th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {inv.number}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {inv.description}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(inv.amount, inv.currency.toUpperCase())}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={inv.status === 'paid' ? 'success' : inv.status === 'open' ? 'warning' : 'default'}
                              size="sm"
                            >
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(inv.createdAt).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Revenue Share Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Share Info */}
            <Card
              padding="lg"
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/50"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('billing.revenueShare')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                クリエイターはツール収益の80〜90%を獲得できます。Toolverseはプラットフォーム手数料として10〜20%を収受します。
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning" size="md">
                  クリエイター 80% / プラットフォーム 20%
                </Badge>
                <Badge variant="success" size="md">
                  クリエイター 90% / プラットフォーム 10% (プロ)
                </Badge>
              </div>
            </Card>

            {/* Revenue Tiers */}
            <Card padding="lg">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                レベニューシェアティア
              </h3>
              <div className="space-y-4">
                {[
                  { tier: 'Standard', split: '80 / 20', range: '¥0 - ¥100,000/mo', active: true },
                  { tier: 'Silver', split: '85 / 15', range: '¥100,000 - ¥500,000/mo', active: false },
                  { tier: 'Gold', split: '88 / 12', range: '¥500,000 - ¥2,000,000/mo', active: false },
                  { tier: 'Platinum', split: '90 / 10', range: '¥2,000,000+/mo', active: false },
                ].map((row) => (
                  <div
                    key={row.tier}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 border transition-colors',
                      row.active
                        ? 'border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20'
                        : 'border-gray-100 dark:border-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {row.active && (
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {row.tier}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{row.range}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {row.split}
                      </span>
                      {row.active && <Badge variant="gradient" size="sm">現在</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payout Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="md">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  累計収益
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(284600)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  今月
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(42800)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  次回振込
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(42800)}
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Apr 1</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
