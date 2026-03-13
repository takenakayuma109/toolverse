'use client';

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

export default function PricingSection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const strengths = [
    {
      icon: Zap,
      titleKey: 'home.pricing.strengths.instant.title',
      descKey: 'home.pricing.strengths.instant.description',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Shield,
      titleKey: 'home.pricing.strengths.secure.title',
      descKey: 'home.pricing.strengths.secure.description',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Globe,
      titleKey: 'home.pricing.strengths.global.title',
      descKey: 'home.pricing.strengths.global.description',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: CreditCard,
      titleKey: 'home.pricing.strengths.flexible.title',
      descKey: 'home.pricing.strengths.flexible.description',
      gradient: 'from-violet-500 to-purple-600',
    },
  ];

  const plans = [
    {
      nameKey: 'home.pricing.plans.free.name',
      priceKey: 'home.pricing.plans.free.price',
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
      periodKey: 'home.pricing.plans.pro.period',
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
      periodKey: 'home.pricing.plans.team.period',
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
    { name: 'Apple Pay', desc: 'home.pricing.payment.applepay' },
    { name: 'Google Pay', desc: 'home.pricing.payment.googlepay' },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className={cn(
            'inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4',
            isDark ? 'bg-violet-950/50 text-violet-300 border border-violet-800/50' :
            isEarth ? 'bg-violet-100/50 text-violet-700 border border-violet-200' :
            'bg-violet-50 text-violet-600 border border-violet-200'
          )}>
            {t('home.pricing.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('home.pricing.title')}
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        {/* Platform strengths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {strengths.map(({ icon: Icon, titleKey, descKey, gradient }) => (
            <div key={titleKey} className={cn(
              'relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1',
              isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' :
              isEarth ? 'bg-white/60 border-gray-200 hover:border-gray-300' :
              'bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg'
            )}>
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                'bg-gradient-to-br shadow-lg',
                gradient
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {t(titleKey)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {plans.map(({ nameKey, priceKey, periodKey, descKey, features, highlighted }) => (
            <div
              key={nameKey}
              className={cn(
                'relative rounded-2xl border p-8 transition-all duration-300',
                highlighted
                  ? 'border-violet-500 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-gray-900 shadow-xl shadow-violet-500/10 scale-[1.02]'
                  : isDark ? 'bg-gray-900/50 border-gray-800' :
                    isEarth ? 'bg-white/60 border-gray-200' :
                    'bg-white border-gray-200'
              )}
            >
              {highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold">
                    {t('home.pricing.popular')}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(nameKey)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(descKey)}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{t(priceKey)}</span>
                {periodKey && <span className="text-gray-500 dark:text-gray-400">{t(periodKey)}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {features.map((fKey) => (
                  <li key={fKey} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    {t(fKey)}
                  </li>
                ))}
              </ul>
              <button
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  highlighted
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {t('common.getStarted')}
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          ))}
        </div>

        {/* Payment system */}
        <div className={cn(
          'rounded-2xl border p-8 md:p-12',
          isDark ? 'bg-gray-900/50 border-gray-800' :
          isEarth ? 'bg-white/60 border-gray-200' :
          'bg-gray-50 border-gray-200'
        )}>
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('home.pricing.paymentTitle')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t('home.pricing.paymentSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {paymentMethods.map(({ name, desc }) => (
              <div key={name} className={cn(
                'flex items-center gap-4 p-5 rounded-xl border',
                isDark ? 'bg-gray-800/50 border-gray-700' :
                isEarth ? 'bg-white border-gray-200' :
                'bg-white border-gray-200'
              )}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-sm">
                  <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t(desc)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t',
            isDark ? 'border-gray-700' : 'border-gray-200'
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
