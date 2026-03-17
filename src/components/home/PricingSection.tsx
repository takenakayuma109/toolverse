'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import {
  Shield,
  CreditCard,
  Zap,
  Globe,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { PageView } from '@/app/page';

interface PricingSectionProps {
  onNavigate?: (page: PageView) => void;
}

export default function PricingSection({ onNavigate }: PricingSectionProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';
  const [isYearly, setIsYearly] = useState(false);

  const strengths = [
    {
      icon: Zap,
      titleKey: 'home.pricing.strengths.instant.title',
      descKey: 'home.pricing.strengths.instant.description',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Shield,
      titleKey: 'home.pricing.strengths.secure.title',
      descKey: 'home.pricing.strengths.secure.description',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Globe,
      titleKey: 'home.pricing.strengths.global.title',
      descKey: 'home.pricing.strengths.global.description',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: CreditCard,
      titleKey: 'home.pricing.strengths.flexible.title',
      descKey: 'home.pricing.strengths.flexible.description',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
  ];

  const plans = [
    {
      nameKey: 'home.pricing.plans.free.name',
      priceKey: 'home.pricing.plans.free.price',
      yearlyPriceKey: 'home.pricing.plans.free.price',
      descKey: 'home.pricing.plans.free.description',
      features: [
        'home.pricing.plans.free.f1',
        'home.pricing.plans.free.f2',
        'home.pricing.plans.free.f3',
      ],
      highlighted: false,
    },
    {
      nameKey: 'home.pricing.plans.pro.name',
      priceKey: 'home.pricing.plans.pro.price',
      yearlyPriceKey: 'home.pricing.plans.pro.yearlyPrice',
      periodKey: 'home.pricing.plans.pro.period',
      yearlyPeriodKey: 'home.pricing.plans.pro.yearlyPeriod',
      descKey: 'home.pricing.plans.pro.description',
      features: [
        'home.pricing.plans.pro.f1',
        'home.pricing.plans.pro.f2',
        'home.pricing.plans.pro.f3',
        'home.pricing.plans.pro.f4',
      ],
      highlighted: true,
    },
    {
      nameKey: 'home.pricing.plans.team.name',
      priceKey: 'home.pricing.plans.team.price',
      yearlyPriceKey: 'home.pricing.plans.team.yearlyPrice',
      periodKey: 'home.pricing.plans.team.period',
      yearlyPeriodKey: 'home.pricing.plans.team.yearlyPeriod',
      descKey: 'home.pricing.plans.team.description',
      features: [
        'home.pricing.plans.team.f1',
        'home.pricing.plans.team.f2',
        'home.pricing.plans.team.f3',
        'home.pricing.plans.team.f4',
      ],
      highlighted: false,
    },
  ];

  const paymentMethods = [
    { name: 'Stripe', desc: 'home.pricing.payment.stripe' },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className={cn(
            'text-sm font-semibold tracking-widest uppercase mb-3',
            isDark ? 'text-violet-400' : 'text-violet-600'
          )}>
            {t('home.pricing.badge')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('home.pricing.title')}
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        {/* Strengths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {strengths.map(({ icon: Icon, titleKey, descKey, color, bg }) => (
            <div key={titleKey} className={cn(
              'p-6 rounded-2xl border transition-all duration-200',
              isDark
                ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                : isEarth
                  ? 'bg-white/80 border-gray-200/80 hover:shadow-md'
                  : 'bg-white border-gray-200/60 hover:shadow-md hover:shadow-gray-200/40'
            )}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1.5">
                {t(titleKey)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Billing period toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={cn(
            'text-sm font-medium transition-colors',
            !isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          )}>
            {t('home.pricing.monthly')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isYearly}
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              'relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors duration-200',
              isYearly
                ? 'bg-violet-600'
                : isDark ? 'bg-white/[0.12]' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                isYearly ? 'translate-x-[28px]' : 'translate-x-[3px]'
              )}
            />
          </button>
          <span className={cn(
            'text-sm font-medium transition-colors',
            isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          )}>
            {t('home.pricing.yearly')}
          </span>
          {isYearly && (
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              {t('home.pricing.yearlySave')}
            </span>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-20">
          {plans.map(({ nameKey, priceKey, yearlyPriceKey, periodKey, yearlyPeriodKey, descKey, features, highlighted }) => (
            <div
              key={nameKey}
              className={cn(
                'relative rounded-2xl border p-8 flex flex-col transition-all duration-200',
                highlighted
                  ? cn(
                      'border-violet-500/40 shadow-lg',
                      isDark
                        ? 'bg-violet-950/20 shadow-violet-500/5'
                        : 'bg-gradient-to-b from-violet-50/80 to-white shadow-violet-500/10'
                    )
                  : cn(
                      isDark
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : isEarth
                          ? 'bg-white/80 border-gray-200/80'
                          : 'bg-white border-gray-200/60'
                    )
              )}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold tracking-wide">
                    {t('home.pricing.popular')}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t(nameKey)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t(descKey)}
                </p>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t(isYearly ? yearlyPriceKey : priceKey)}
                </span>
                {periodKey && (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    {t(isYearly && yearlyPeriodKey ? yearlyPeriodKey : periodKey)}
                  </span>
                )}
              </div>
              <ul className="space-y-3 flex-1">
                {features.map((fKey) => (
                  <li key={fKey} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    {t(fKey)}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate?.('auth')}
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-8',
                  highlighted
                    ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20'
                    : isDark
                      ? 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {t('common.getStarted')}
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div className={cn(
          'rounded-2xl border p-8 md:p-12',
          isDark
            ? 'bg-white/[0.02] border-white/[0.06]'
            : isEarth
              ? 'bg-white/60 border-gray-200/80'
              : 'bg-gray-50/80 border-gray-200/60'
        )}>
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('home.pricing.paymentTitle')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-[15px]">
              {t('home.pricing.paymentSubtitle')}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className={cn(
              'flex items-center gap-4 p-5 rounded-xl border max-w-md w-full',
              isDark
                ? 'bg-white/[0.03] border-white/[0.06]'
                : isEarth
                  ? 'bg-white border-gray-200'
                  : 'bg-white border-gray-200/60'
            )}>
              <div className="flex-shrink-0">
                <svg className="h-8" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#635BFF" d="M112.5 50H7.5C3.36 50 0 46.64 0 42.5v-35C0 3.36 3.36 0 7.5 0h105C116.64 0 120 3.36 120 7.5v35c0 4.14-3.36 7.5-7.5 7.5z"/>
                  <path fill="#fff" d="M55.2 21.5c0-2.73-1.32-4.88-3.85-4.88-2.54 0-4.08 2.15-4.08 4.86 0 3.21 1.81 4.83 4.42 4.83 1.27 0 2.23-.29 2.95-.69v-2.14c-.72.36-1.55.58-2.6.58-1.03 0-1.94-.36-2.06-1.6h5.18c0-.14.04-.69.04-1zm-5.2-1.01c0-1.19.73-1.69 1.39-1.69.64 0 1.33.5 1.33 1.69h-2.72zm-6.74-3.87c-1.04 0-1.71.49-2.08.82l-.14-.65h-2.33v12.42l2.65-.56.01-3.02c.38.28.95.67 1.88.67 1.9 0 3.63-1.53 3.63-4.9-.01-3.08-1.76-4.78-3.62-4.78zm-.64 7.35c-.63 0-1-.22-1.25-.5l-.01-3.95c.28-.31.65-.52 1.26-.52.96 0 1.63 1.08 1.63 2.48 0 1.42-.66 2.49-1.63 2.49zm-9.93-7.98l2.66-.57V13.2l-2.66.57v2.22zm0 .76h2.66v9.27h-2.66v-9.27zm-2.83 .78l-.17-.78h-2.28v9.27h2.65v-6.29c.63-.82 1.69-.67 2.02-.56v-2.42c-.34-.13-1.59-.36-2.22.78zm-5.54-.78h-1.78v-2.24l-2.65.57v1.67h-1.28v2.03h1.28v4.25c0 1.75.84 2.69 2.97 2.69.59 0 1.27-.13 1.63-.28v-2.07c-.34.11-.76.18-1.17.18-.62 0-.85-.24-.85-.84v-3.93h1.78v-2.03h.07zm-10.65 1.73c0-.37.31-.51.81-.51.72 0 1.64.22 2.36.61v-2.24c-.79-.31-1.57-.44-2.36-.44-1.93 0-3.21 1.01-3.21 2.69 0 2.63 3.61 2.21 3.61 3.34 0 .44-.38.58-.92.58-.79 0-1.81-.33-2.61-.77v2.27c.89.38 1.79.55 2.61.55 1.98 0 3.34-.98 3.34-2.69-.01-2.83-3.63-2.33-3.63-3.39z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('home.pricing.payment.stripe')}
                </p>
              </div>
            </div>
          </div>

          <div className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t',
            isDark ? 'border-white/[0.06]' : 'border-gray-200/60'
          )}>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              {t('home.pricing.pci')}
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Globe className="w-4 h-4 text-blue-500" />
              {t('home.pricing.currencies')}
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Zap className="w-4 h-4 text-amber-500" />
              {t('home.pricing.creatorPayout')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
