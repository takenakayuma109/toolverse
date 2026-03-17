'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
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
} from 'lucide-react';
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
    stripePriceId: null,
    stripeYearlyPriceId: null,
    features: [
      '5 tools',
      '1 GB storage',
      'Community support',
      'Basic analytics',
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? null,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY ?? null,
    features: [
      'Unlimited tools',
      '10 GB storage',
      'Priority support',
      'Advanced analytics',
      'API access',
      '90% revenue share',
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY ?? null,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY ?? null,
    features: [
      'Everything in Pro',
      'Team collaboration',
      '50 GB storage',
      'SSO / SAML',
      'Dedicated support',
      'Custom domain',
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
    stripePriceId: null,
    stripeYearlyPriceId: null,
    features: [
      'Custom limits',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations',
      'Dedicated account manager',
      'Audit logs',
    ],
    current: false,
    highlight: false,
  },
] as const;

const STATIC_USAGE_STATS = [
  { label: 'Tools used', value: '5', limit: '5', unit: 'tools', percent: 100 },
  { label: 'Storage', value: '0.8', limit: '1', unit: 'GB', percent: 80 },
  { label: 'API calls', value: '1,240', limit: '10,000', unit: 'calls', percent: 12.4 },
  { label: 'Bandwidth', value: '3.2', limit: '10', unit: 'GB', percent: 32 },
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

  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

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
            setPaymentMethods(data.paymentMethods ?? []);
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
        label: t('billing.activeUsers') || 'Active Users',
        value: mauStats.activeUsers.toLocaleString(),
        limit: mauStats.limit !== null ? mauStats.limit.toLocaleString() : '∞',
        unit: 'users',
        percent: Math.round(mauPercent * 10) / 10,
      });
    }
    return stats;
  }, [mauStats, t]);

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleAddCard = async () => {
    try {
      const res = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, cardExpiry, cardCvc, cardName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.paymentMethod) {
          setPaymentMethods((prev) => [...prev, data.paymentMethod]);
        }
      }
    } catch {
      // handle error
    }
    setShowAddCard(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
  };

  const tabs: { id: BillingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'plans', label: t('billing.subscription'), icon: <Crown className="w-4 h-4" /> },
    { id: 'payment', label: t('billing.paymentMethods') || 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'history', label: t('billing.billingHistory') || 'Billing History', icon: <Receipt className="w-4 h-4" /> },
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
            Manage your subscription, payment methods, and billing history.
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
                <Badge variant="gradient" size="sm">Active</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('billing.plans.free.description')}
              </p>
            </div>
            <Button onClick={() => setActiveTab('plans')}>{t('billing.upgrade')}</Button>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('billing.subscription')}
              </h2>
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
                        Current
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
                      disabled={plan.current}
                      onClick={async () => {
                        if (plan.id === 'enterprise' || plan.current || !plan.stripePriceId) return;
                        try {
                          const res = await fetch('/api/billing/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              planId: plan.id,
                              priceId: plan.stripePriceId,
                              successUrl: '/billing?success=true',
                              cancelUrl: '/billing',
                            }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        } catch {
                          // handle error
                        }
                      }}
                    >
                      {plan.current
                        ? t('billing.currentPlan')
                        : plan.id === 'enterprise'
                          ? 'Contact Sales'
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
                Payment Methods
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddCard(!showAddCard)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <Card padding="lg" className="border-violet-200 dark:border-violet-900/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Add Payment Method
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Cardholder Name"
                    placeholder="YUMA TAKENAKA"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                  <Input
                    label="Card Number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    icon={<CreditCard className="w-4 h-4" />}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    />
                    <Input
                      label="CVC"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <Shield className="w-3.5 h-3.5" />
                    Payments are securely processed by Stripe. We never store your card details.
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddCard}>Add Card</Button>
                    <Button variant="ghost" onClick={() => setShowAddCard(false)}>
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
                <p className="text-gray-500 dark:text-gray-400">No payment methods on file.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add a card to subscribe to a plan.
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
                          Expires {pm.card?.expMonth}/{pm.card?.expYear}
                        </p>
                      </div>
                      {pm.isDefault && (
                        <Badge variant="success" size="sm">Default</Badge>
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
              Billing History
            </h2>
            {loadingInvoices ? (
              <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
            ) : invoices.length === 0 ? (
              <Card padding="lg" className="text-center">
                <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No invoices yet.</p>
              </Card>
            ) : (
              <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          Invoice
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          Description
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          Amount
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          Status
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                          Date
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
                Creators earn 80-90% of revenue from their tools. Toolverse takes 10-20% for
                platform fees, payment processing, and infrastructure.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning" size="md">
                  80% Creator / 20% Platform
                </Badge>
                <Badge variant="success" size="md">
                  90% Creator / 10% Platform (Pro)
                </Badge>
              </div>
            </Card>

            {/* Revenue Tiers */}
            <Card padding="lg">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Share Tiers
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
                      {row.active && <Badge variant="gradient" size="sm">Current</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payout Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="md">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Lifetime Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(284600)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  This Month
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(42800)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Next Payout
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
