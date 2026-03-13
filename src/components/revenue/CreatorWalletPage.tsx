'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn, formatCurrency } from '@/lib/utils';
import { useRevenueStore, CREATOR_TIERS, INFRA_PRICING } from '@/store/revenue';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import {
  Wallet,
  Clock,
  TrendingUp,
  Percent,
  Crown,
  ShieldCheck,
  User,
  Calculator,
  BarChart3,
  Server,
  CreditCard,
  Building2,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Database,
  Search,
  Bell,
  Lock,
  Box,
  Bot,
  Cpu,
} from 'lucide-react';
import type { PayoutMethodType } from '@/types';

const TIER_ICONS = { early: Crown, verified: ShieldCheck, standard: User } as const;
const TIER_GRADIENTS = {
  early: 'from-amber-500 to-orange-500',
  verified: 'from-violet-500 to-indigo-500',
  standard: 'from-gray-500 to-slate-500',
} as const;

const PLATFORM_COMPARISONS = [
  { name: 'Apple App Store', creatorShare: 70, color: 'bg-gray-400' },
  { name: 'Google Play', creatorShare: 70, color: 'bg-green-500' },
  { name: 'Steam', creatorShare: 70, color: 'bg-blue-500' },
  { name: 'Epic Games', creatorShare: 88, color: 'bg-slate-700 dark:bg-slate-400' },
  { name: 'Toolverse (Standard)', creatorShare: 85, color: 'bg-indigo-500' },
  { name: 'Toolverse (Verified)', creatorShare: 90, color: 'bg-violet-500' },
  { name: 'Toolverse (Early)', creatorShare: 95, color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
];

const INFRA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ai_api: Bot,
  storage: Database,
  database: Server,
  search: Search,
  automation: Zap,
  notification: Bell,
  auth: Lock,
  workspace: Box,
};

const PAYOUT_METHODS: { type: PayoutMethodType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'stripe_connect', label: 'Stripe Connect', icon: CreditCard },
  { type: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { type: 'paypal', label: 'PayPal', icon: CircleDollarSign },
];

const STATUS_BADGE_MAP: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'error',
};

export default function CreatorWalletPage() {
  const { } = useTranslation();
  const { wallet, infraUsage, isLoading, loadWallet, requestPayout } = useRevenueStore();
  const [calcPrice, setCalcPrice] = useState(1000);
  const [payoutRequested, setPayoutRequested] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const currentTierInfo = useMemo(
    () => CREATOR_TIERS.find((t) => t.tier === wallet?.tier) ?? CREATOR_TIERS[2],
    [wallet?.tier],
  );

  const TierIcon = TIER_ICONS[currentTierInfo.tier];

  const revenueBreakdown = useMemo(
    () =>
      CREATOR_TIERS.map((tier) => ({
        ...tier,
        creatorAmount: Math.round(calcPrice * (tier.creatorShare / 100)),
        platformAmount: Math.round(calcPrice * (tier.platformShare / 100)),
      })),
    [calcPrice],
  );

  const maxBarGross = useMemo(() => {
    if (!wallet) return 1;
    return Math.max(...wallet.monthlyRevenue.map((m) => m.grossRevenue), 1);
  }, [wallet]);

  const handleRequestPayout = async () => {
    if (!wallet || wallet.balance < 10000) return;
    setPayoutRequested(true);
    await requestPayout(wallet.balance, wallet.payoutMethod?.type ?? 'stripe_connect');
    setTimeout(() => setPayoutRequested(false), 2000);
  };

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ───────── Header ───────── */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Creator Wallet
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl">
                Creator First — あなたの収益を最大化する、業界最高水準のレベニューシェア。
              </p>
            </div>
            <Badge
              variant="gradient"
              size="md"
              className="flex items-center gap-2 self-start"
            >
              <TierIcon className="w-4 h-4" />
              {currentTierInfo.label} — {currentTierInfo.creatorShare}%
            </Badge>
          </div>
        </div>

        {/* ───────── Wallet Overview (4 cards) ───────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Available Balance',
              value: wallet.balance,
              icon: Wallet,
              gradient: 'from-violet-500 to-indigo-500',
              action: (
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  disabled={wallet.balance < 10000 || isLoading || payoutRequested}
                  isLoading={isLoading}
                  onClick={handleRequestPayout}
                >
                  {payoutRequested ? 'Requested!' : 'Request Payout'}
                </Button>
              ),
            },
            {
              label: 'Pending Payout',
              value: wallet.pendingPayout,
              icon: Clock,
              gradient: 'from-amber-500 to-orange-500',
            },
            {
              label: 'Lifetime Earnings',
              value: wallet.lifetimeEarnings,
              icon: TrendingUp,
              gradient: 'from-emerald-500 to-green-500',
            },
            {
              label: 'Platform Fee (Lifetime)',
              value: wallet.lifetimePlatformFee,
              icon: Percent,
              gradient: 'from-rose-500 to-pink-500',
            },
          ].map((card) => (
            <Card key={card.label} padding="lg" className="relative overflow-hidden">
              <div
                className={cn(
                  'absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-15',
                  card.gradient,
                )}
              />
              <div className="relative">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center mb-3',
                    card.gradient,
                  )}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(card.value, wallet.currency)}
                </p>
                {card.action}
              </div>
            </Card>
          ))}
        </div>

        {/* ───────── Creator Tier System ───────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Creator Tier System
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            クリエイターの成長に合わせて、レベニューシェア率が向上します。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {CREATOR_TIERS.map((tier) => {
              const Icon = TIER_ICONS[tier.tier];
              const isActive = tier.tier === wallet.tier;
              const gradient = TIER_GRADIENTS[tier.tier];
              return (
                <Card
                  key={tier.tier}
                  padding="lg"
                  className={cn(
                    'relative transition-all duration-300',
                    isActive &&
                      'ring-2 ring-violet-500 shadow-xl shadow-violet-500/20 dark:shadow-violet-500/10',
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-px -left-px -right-px -bottom-px rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 pointer-events-none" />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center',
                          gradient,
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {isActive && <Badge variant="gradient" size="sm">Current</Badge>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {tier.label}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {tier.creatorShare}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        / {tier.platformShare}% platform
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                        style={{ width: `${tier.creatorShare}%` }}
                      />
                    </div>
                    <ul className="space-y-2">
                      {tier.requirements.map((req) => (
                        <li
                          key={req}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Platform Comparison */}
          <Card padding="lg">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              Platform Comparison — Creator Share
            </h3>
            <div className="space-y-3">
              {PLATFORM_COMPARISONS.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-40 sm:w-48 flex-shrink-0 truncate">
                    {p.name}
                  </span>
                  <div className="flex-1 h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', p.color)}
                      style={{ width: `${p.creatorShare}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">
                    {p.creatorShare}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ───────── Revenue Calculator ───────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-violet-500" />
            Revenue Calculator
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ツールの月額料金を入力すると、各ティアでの収益を確認できます。
          </p>
          <Card padding="lg">
            <div className="mb-6 max-w-xs">
              <Input
                label="Tool Price (JPY / month)"
                type="number"
                value={calcPrice}
                min={0}
                onChange={(e) => setCalcPrice(Math.max(0, Number(e.target.value)))}
                icon={<CircleDollarSign className="w-4 h-4" />}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {revenueBreakdown.map((tier) => {
                const gradient = TIER_GRADIENTS[tier.tier];
                return (
                  <div
                    key={tier.tier}
                    className={cn(
                      'rounded-xl border p-5 transition-colors',
                      tier.tier === wallet.tier
                        ? 'border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20'
                        : 'border-gray-100 dark:border-gray-800',
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {tier.label}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Creator</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(tier.creatorAmount, wallet.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Toolverse</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {formatCurrency(tier.platformAmount, wallet.currency)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                          style={{ width: `${tier.creatorShare}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* ───────── Monthly Revenue Chart ───────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            Monthly Revenue
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            過去6ヶ月の収益推移
          </p>
          <Card padding="lg" className="overflow-hidden">
            {/* Bar Visualization */}
            <div className="flex items-end gap-3 h-48 mb-6 px-2">
              {wallet.monthlyRevenue.map((m) => {
                const creatorPct = (m.creatorShare / maxBarGross) * 100;
                const feePct = (m.platformFee / maxBarGross) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {formatCurrency(m.grossRevenue, wallet.currency)}
                    </p>
                    <div className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden">
                      <div
                        className="bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-500"
                        style={{ height: `${creatorPct * 1.6}px` }}
                      />
                      <div
                        className="bg-gradient-to-t from-rose-400 to-rose-300 transition-all duration-500"
                        style={{ height: `${feePct * 1.6}px` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {m.month.slice(5)}月
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-violet-600 to-violet-400" />
                Creator Share
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-rose-400 to-rose-300" />
                Platform Fee
              </span>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Month', 'Gross', 'Creator Share', 'Platform Fee', 'Refunds', 'Net Payout', 'Txns'].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {wallet.monthlyRevenue.map((m) => (
                    <tr
                      key={m.month}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {m.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatCurrency(m.grossRevenue, wallet.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(m.creatorShare, wallet.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-rose-500 whitespace-nowrap">
                        {formatCurrency(m.platformFee, wallet.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        -{formatCurrency(m.refunds, wallet.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(m.netPayout, wallet.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {m.transactions.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ───────── Infrastructure Usage ───────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-500" />
            Platform Infrastructure Usage
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            第2の収益柱 — 従量課金制のインフラサービス。無料枠を超えた分のみ課金されます。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INFRA_PRICING.map((svc) => {
              const usage = infraUsage.find((u) => u.service === svc.service);
              const usageVal = usage?.usage ?? 0;
              const cost = usage?.cost ?? 0;
              const usagePercent = Math.min(
                100,
                (usageVal / Math.max(svc.freeAllowance, 1)) * 100,
              );
              const overFree = usageVal > svc.freeAllowance;
              const InfraIcon = INFRA_ICONS[svc.service] ?? Cpu;

              return (
                <Card key={svc.service} padding="md" className="relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        overFree
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-violet-100 dark:bg-violet-900/30',
                      )}
                    >
                      <InfraIcon
                        className={cn(
                          'w-4.5 h-4.5',
                          overFree
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-violet-600 dark:text-violet-400',
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {svc.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${svc.pricePerUnit}/{svc.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>
                      {usageVal.toLocaleString()} {usage?.unit ?? svc.unit}
                    </span>
                    <span>Free: {svc.freeAllowance.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        overFree
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-violet-500 to-indigo-500',
                      )}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="text-right text-sm font-bold text-gray-900 dark:text-white">
                    ${cost.toFixed(2)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ───────── Payout Section ───────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-500" />
            Payout Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            出金方法の管理と振込履歴の確認ができます。最低出金額: ¥10,000
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Current Method */}
            <Card padding="lg" className="lg:col-span-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Current Payout Method
              </p>
              {wallet.payoutMethod ? (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {wallet.payoutMethod.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {wallet.payoutMethod.details}
                    </p>
                  </div>
                  {wallet.payoutMethod.isVerified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No payout method configured
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {PAYOUT_METHODS.map((pm) => (
                  <Button
                    key={pm.type}
                    variant={
                      wallet.payoutMethod?.type === pm.type ? 'primary' : 'outline'
                    }
                    size="sm"
                  >
                    <pm.icon className="w-4 h-4 mr-1" />
                    {pm.label}
                  </Button>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Payout Schedule</p>
                <p>Monthly (1st) or On Demand • Min ¥10,000</p>
              </div>
            </Card>

            {/* Payout History */}
            <Card padding="none" className="lg:col-span-2 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Payout History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800/50">
                      {['Date', 'Amount', 'Method', 'Status', 'Reference'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {wallet.payoutHistory.map((po) => (
                      <tr
                        key={po.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {new Date(po.requestedAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(po.amount, po.currency)}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap">
                          {po.method.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-3">
                          <Badge
                            variant={STATUS_BADGE_MAP[po.status] ?? 'default'}
                            size="sm"
                          >
                            {po.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {po.reference}
                        </td>
                      </tr>
                    ))}
                    {wallet.payoutHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-sm text-gray-400"
                        >
                          No payout records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* ───────── Ecosystem Model Footer ───────── */}
        <section className="mb-8">
          <Card
            padding="lg"
            className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 border-0 text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <div className="relative text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 text-sm sm:text-base font-semibold">
                {[
                  'App Store',
                  'Product Hunt',
                  'Stripe',
                  'AWS',
                  'Workspace',
                ].map((item, i, arr) => (
                  <span key={item} className="flex items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm">
                      {item}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-white/50">+</span>
                    )}
                  </span>
                ))}
                <span className="text-white/50">=</span>
                <span className="px-4 py-1.5 rounded-lg bg-white/25 backdrop-blur-sm font-bold">
                  Toolverse
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold tracking-tight">
                Creator First, Platform Second, Ecosystem Always
              </p>
              <p className="text-sm text-white/70 mt-2 max-w-lg mx-auto">
                クリエイターを最優先に。プラットフォームは支える存在として。エコシステムは永遠に。
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
