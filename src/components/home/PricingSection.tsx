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
              'flex flex-col items-center gap-3 p-6 rounded-xl border max-w-sm w-full',
              isDark
                ? 'bg-white/[0.03] border-white/[0.06]'
                : isEarth
                  ? 'bg-white border-gray-200'
                  : 'bg-white border-gray-200/60'
            )}>
              <svg className="h-10" viewBox="0 0 468 222.5" xmlns="http://www.w3.org/2000/svg">
                <path fill="#635BFF" d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zm-63.5-36.3c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zm-71.3-74.8l25.1-5.4V36l-25.1 5.3v20.4zm0 7.3h25.1v87.5h-25.1v-87.5zm-26.7 7.4l-1.6-7.4h-21.6v87.5h25v-59.3c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zm-50.1-7.4h-19.4v-22l-25.1 5.3v82.2c0 15.2 11.4 26.4 26.6 26.4 8.4 0 14.6-1.5 18-3.4v-20.2c-3.2 1.3-19.1 5.9-19.1-8.9V90.6h19.1V69.5h-.1zm-68.9 20.1c0-3.4 2.8-4.8 7.5-4.8 6.7 0 15.2 2 21.9 5.7v-20.8c-7.3-2.9-14.6-4.1-21.9-4.1-17.9 0-29.8 9.3-29.8 24.9 0 24.3 33.5 20.4 33.5 30.9 0 4.1-3.5 5.4-8.5 5.4-7.3 0-16.7-3-24.1-7.1v21.1c8.2 3.5 16.5 5.1 24.1 5.1 18.3 0 30.9-9.1 30.9-24.9-.1-26.2-33.6-21.6-33.6-31.4z"/>
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {t('home.pricing.payment.stripe')}
              </p>
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
