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
                <svg className="w-16 h-7" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.3 12.3 0 0 1-4.56.85c-4.05 0-6.83-2.11-6.83-7.17 0-4.08 2.32-7.26 6.16-7.26 3.54 0 6.09 2.57 6.09 7.01 0 .57-.04 1.2-.05 1.65zm-6.03-2.89c0-1.38.67-2.83 2.16-2.83 1.42 0 2.04 1.38 2.06 2.83h-4.22zM44.15 5.8l4.08-.86v3.55h3.09v3.62h-3.09v4.35c0 1.69.95 2 1.81 2 .65 0 1.16-.1 1.61-.28v3.47c-.62.35-1.69.6-2.92.6-3.37 0-4.57-1.98-4.57-5.23V12.1h-1.76V8.5h1.76V5.8zM40.6 5.46c0-1.36-1.08-2.35-2.42-2.35-1.33 0-2.42 1-2.42 2.35 0 1.36 1.09 2.37 2.42 2.37 1.34 0 2.42-1.01 2.42-2.37zM35.74 8.5h4.07v13.16h-4.07V8.5zM29.8 12.14c-.46-.2-1.22-.42-1.97-.42-.95 0-1.4.32-1.4.82 0 1.74 5.55.95 5.55 5.6 0 3.04-2.55 4.08-5.16 4.08-1.56 0-3.24-.44-4.56-1.12l.93-3.17c.72.42 1.88.87 2.98.87 1 0 1.64-.27 1.64-.95 0-1.93-5.45-.93-5.45-5.55 0-2.86 2.14-4.2 5.02-4.2 1.57 0 3.06.46 3.84.82l-1.42 3.22zM15.86 13.39c0-2.57 1.13-4.93 3.17-4.93 1.12 0 1.83.42 2.3 1.05l.13-1h3.78v13.16h-3.78l-.17-.92c-.51.62-1.27 1.12-2.53 1.12-1.82 0-2.9-1.32-2.9-3.54v-4.94zm5.49-1.38c-.35-.42-.75-.6-1.3-.6-.97 0-1.35.95-1.35 2.25v4.19c0 .92.25 1.65 1.13 1.65.48 0 .93-.22 1.28-.6l.24-.02V12.01zM6.49 22.22c-2.14 0-4.17-.5-5.67-1.33l1.08-3.5c1.25.72 2.92 1.2 4.19 1.2 1.01 0 1.56-.3 1.56-.82 0-.6-.67-.85-2.25-1.44C3.22 15.5 1 14.43 1 11.35c0-3.16 2.6-5.22 6.25-5.22 1.8 0 3.63.46 4.95 1.2L11.08 10.7c-1.06-.6-2.35-.97-3.56-.97-.8 0-1.3.27-1.3.72 0 .55.6.8 1.93 1.3 2.93 1.07 5.48 2.14 5.48 5.45 0 3.34-2.6 5.02-7.14 5.02z" fill="#635BFF"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
