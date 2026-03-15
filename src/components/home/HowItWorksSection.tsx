'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import {
  Store,
  Code2,
  User,
  Receipt,
  ArrowDown,
  ArrowRight,
  Sparkles,
  CreditCard,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className={cn(
            'text-sm font-semibold tracking-widest uppercase mb-3',
            isDark ? 'text-violet-400' : 'text-violet-600'
          )}>
            {t('home.howItWorks.badge')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('home.howItWorks.title')}
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        {/* Two-column layout: Users vs Developers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-16">

          {/* --- User side --- */}
          <div className={cn(
            'relative rounded-3xl border p-8 md:p-10 overflow-hidden',
            isDark
              ? 'bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border-blue-500/20'
              : isEarth
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-200/60'
                : 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-blue-200/50'
          )}>
            {/* Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center',
                isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'
              )}>
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('home.howItWorks.user.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('home.howItWorks.user.subtitle')}
                </p>
              </div>
            </div>

            {/* Flow */}
            <div className="space-y-5">
              {/* Step 1 */}
              <div className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border',
                isDark
                  ? 'bg-white/[0.03] border-white/[0.06]'
                  : 'bg-white/80 border-gray-200/60'
              )}>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {t('home.howItWorks.user.step1.title')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.howItWorks.user.step1.desc')}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className={cn('w-5 h-5', isDark ? 'text-blue-400/40' : 'text-blue-300')} />
              </div>

              {/* Step 2 */}
              <div className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border',
                isDark
                  ? 'bg-white/[0.03] border-white/[0.06]'
                  : 'bg-white/80 border-gray-200/60'
              )}>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {t('home.howItWorks.user.step2.title')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.howItWorks.user.step2.desc')}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className={cn('w-5 h-5', isDark ? 'text-blue-400/40' : 'text-blue-300')} />
              </div>

              {/* Step 3: Benefit */}
              <div className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border-2',
                isDark
                  ? 'bg-blue-500/[0.08] border-blue-500/30'
                  : 'bg-blue-50 border-blue-200'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  isDark ? 'bg-blue-500/30' : 'bg-blue-100'
                )}>
                  <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {t('home.howItWorks.user.benefit.title')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.howItWorks.user.benefit.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Key point */}
            <div className={cn(
              'mt-8 flex items-center gap-3 px-5 py-4 rounded-xl',
              isDark ? 'bg-blue-500/10' : 'bg-blue-100/60'
            )}>
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className={cn(
                'text-sm font-medium',
                isDark ? 'text-blue-300' : 'text-blue-700'
              )}>
                {t('home.howItWorks.user.keyPoint')}
              </p>
            </div>
          </div>

          {/* --- Developer side --- */}
          <div className={cn(
            'relative rounded-3xl border p-8 md:p-10 overflow-hidden',
            isDark
              ? 'bg-gradient-to-br from-violet-950/30 to-purple-950/20 border-violet-500/20'
              : isEarth
                ? 'bg-gradient-to-br from-violet-50 to-purple-50/60 border-violet-200/60'
                : 'bg-gradient-to-br from-violet-50/80 to-purple-50/50 border-violet-200/50'
          )}>
            {/* Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center',
                isDark ? 'bg-violet-500/20' : 'bg-violet-500/10'
              )}>
                <Code2 className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('home.howItWorks.dev.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('home.howItWorks.dev.subtitle')}
                </p>
              </div>
            </div>

            {/* Flow */}
            <div className="space-y-5">
              {/* Step 1 */}
              <div className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border',
                isDark
                  ? 'bg-white/[0.03] border-white/[0.06]'
                  : 'bg-white/80 border-gray-200/60'
              )}>
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {t('home.howItWorks.dev.step1.title')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.howItWorks.dev.step1.desc')}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className={cn('w-5 h-5', isDark ? 'text-violet-400/40' : 'text-violet-300')} />
              </div>

              {/* Step 2 */}
              <div className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border',
                isDark
                  ? 'bg-white/[0.03] border-white/[0.06]'
                  : 'bg-white/80 border-gray-200/60'
              )}>
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {t('home.howItWorks.dev.step2.title')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.howItWorks.dev.step2.desc')}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className={cn('w-5 h-5', isDark ? 'text-violet-400/40' : 'text-violet-300')} />
              </div>

              {/* Step 3: Benefit */}
              <div className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border-2',
                isDark
                  ? 'bg-violet-500/[0.08] border-violet-500/30'
                  : 'bg-violet-50 border-violet-200'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  isDark ? 'bg-violet-500/30' : 'bg-violet-100'
                )}>
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {t('home.howItWorks.dev.benefit.title')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.howItWorks.dev.benefit.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Key point */}
            <div className={cn(
              'mt-8 flex items-center gap-3 px-5 py-4 rounded-xl',
              isDark ? 'bg-violet-500/10' : 'bg-violet-100/60'
            )}>
              <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
              <p className={cn(
                'text-sm font-medium',
                isDark ? 'text-violet-300' : 'text-violet-700'
              )}>
                {t('home.howItWorks.dev.keyPoint')}
              </p>
            </div>
          </div>
        </div>

        {/* Center diagram: Unified billing */}
        <div className={cn(
          'relative rounded-3xl border p-8 md:p-12',
          isDark
            ? 'bg-gradient-to-r from-amber-950/20 via-orange-950/20 to-amber-950/20 border-amber-500/20'
            : isEarth
              ? 'bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-amber-200/60'
              : 'bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-amber-50/60 border-amber-200/50'
        )}>
          <div className="text-center mb-10">
            <div className={cn(
              'inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5',
              isDark ? 'bg-amber-500/20' : 'bg-amber-500/10'
            )}>
              <FileText className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('home.howItWorks.billing.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-[15px]">
              {t('home.howItWorks.billing.desc')}
            </p>
          </div>

          {/* Visual flow */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {/* Multiple apps */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {[
                { name: 'App A', price: '¥980/mo' },
                { name: 'App B', price: '¥500/mo' },
                { name: 'App C', price: t('common.free') },
              ].map((app) => (
                <div
                  key={app.name}
                  className={cn(
                    'flex items-center justify-between gap-6 px-5 py-3 rounded-xl border',
                    isDark
                      ? 'bg-white/[0.04] border-white/[0.08]'
                      : 'bg-white border-gray-200/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    )}>
                      <Store className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{app.name}</span>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold tabular-nums',
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  )}>{app.price}</span>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center py-2 md:py-0">
              <ArrowDown className={cn('w-6 h-6 md:hidden', isDark ? 'text-amber-400/50' : 'text-amber-400')} />
              <ArrowRight className={cn('w-6 h-6 hidden md:block', isDark ? 'text-amber-400/50' : 'text-amber-400')} />
            </div>

            {/* Unified invoice */}
            <div className={cn(
              'w-full md:w-auto px-8 py-6 rounded-2xl border-2 text-center',
              isDark
                ? 'bg-amber-500/[0.08] border-amber-500/30'
                : 'bg-amber-50 border-amber-300/60'
            )}>
              <CreditCard className={cn(
                'w-8 h-8 mx-auto mb-3',
                isDark ? 'text-amber-400' : 'text-amber-500'
              )} />
              <p className="font-bold text-gray-900 dark:text-white text-lg">
                {t('home.howItWorks.billing.invoice')}
              </p>
              <p className={cn(
                'text-2xl font-bold mt-1 tabular-nums',
                isDark ? 'text-amber-400' : 'text-amber-600'
              )}>
                ¥1,480<span className="text-sm font-normal text-gray-400">/mo</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('home.howItWorks.billing.invoiceDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
