'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Check, Zap, Users, Building2, Crown } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    icon: Zap,
    nameKey: 'billing.plans.free.name',
    priceKey: 'billing.plans.free.price',
    periodKey: null,
    descriptionKey: 'billing.plans.free.description',
    features: ['5 tools', '1 GB storage', 'Community support', 'Basic analytics'],
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
    features: ['Unlimited tools', '10 GB storage', 'Priority support', 'Advanced analytics', 'API access'],
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
    features: ['Everything in Pro', 'Team collaboration', '50 GB storage', 'SSO', 'Dedicated support'],
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
    features: ['Custom limits', 'SLA guarantee', 'On-premise option', 'Custom integrations'],
    current: false,
    highlight: false,
  },
] as const;

const USAGE_STATS = [
  { label: 'Tools used', value: '5', limit: '5', unit: 'tools', percent: 100 },
  { label: 'Storage', value: '0.8', limit: '1', unit: 'GB', percent: 80 },
  { label: 'API calls', value: '1,240', limit: '10,000', unit: 'calls', percent: 12.4 },
];

export default function BillingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('billing.title')}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your subscription and usage.
          </p>
        </div>

        {/* Current plan */}
        <Card padding="lg" className="mb-8 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('billing.currentPlan')}
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('billing.plans.free.name')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('billing.plans.free.description')}
              </p>
            </div>
            <Button>{t('billing.upgrade')}</Button>
          </div>
        </Card>

        {/* Usage stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('billing.usage')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, stat.percent)}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Plan comparison */}
        <div className="mb-8">
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <plan.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
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
                <div className="mb-6">
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
                >
                  {plan.current ? 'Current Plan' : t('billing.upgrade')}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Revenue share for creators */}
        <Card padding="lg" className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/50">
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
      </div>
    </div>
  );
}
