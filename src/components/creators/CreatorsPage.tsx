'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import {
  ArrowRight,
  Rocket,
  Code2,
  Upload,
  LogIn,
  CreditCard,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

export default function CreatorsPage() {
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const steps = [
    {
      icon: Rocket,
      number: '01',
      title: 'アプリを作る',
      desc: 'Claude / Cursor / 任意のツールで開発',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Code2,
      number: '02',
      title: 'SDKを追加（1行）',
      desc: 'initToolverse() を追加するだけ',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Upload,
      number: '03',
      title: 'アップロードして公開',
      desc: '即時掲載・すぐにユーザーに届く',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const sdkFeatures = [
    { icon: LogIn, title: 'Googleログイン自動対応', desc: 'ユーザー認証をゼロから構築する必要なし' },
    { icon: CreditCard, title: '課金がすぐ使える', desc: 'サブスク・従量課金をSDKだけで実装' },
    { icon: Users, title: 'ユーザー管理不要', desc: 'Toolverseが管理を代行' },
    { icon: BarChart3, title: '売上ダッシュボード', desc: 'リアルタイムの収益分析' },
    { icon: TrendingUp, title: 'トラフィック増加', desc: 'Toolverseマーケットプレイスからの流入' },
  ];

  const withoutSdk = [
    { text: '課金連携なし', hasAccess: false },
    { text: 'ランキング非表示 / 低優先', hasAccess: false },
    { text: 'レコメンド対象外', hasAccess: false },
    { text: '「External App」表示', hasAccess: false },
  ];

  const withSdk = [
    { text: 'ログイン・課金・管理が自動', hasAccess: true },
    { text: 'ランキング上位表示', hasAccess: true },
    { text: 'レコメンド対象', hasAccess: true },
    { text: '「Verified by Toolverse」バッジ', hasAccess: true },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent dark:from-violet-600/10 dark:via-indigo-600/5" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
              クリエイター向け
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="text-gray-900 dark:text-white">
              あなたのアプリを、
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              すぐに公開・収益化
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            SDKを1行追加するだけで、ログイン・課金・ユーザー管理が自動で動きます
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="primary"
              className="gap-2 group text-[15px] px-8 py-4 rounded-2xl shadow-xl shadow-violet-500/15"
              onClick={() => router.push('/submit')}
            >
              SDKを使って公開する（推奨）
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-[15px] px-8 py-4 rounded-2xl"
              onClick={() => router.push('/submit')}
            >
              そのまま公開する（制限あり）
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            3ステップで公開
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-14 max-w-lg mx-auto">
            最小の労力で、最大のリーチ
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className={cn(
                  'relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02]',
                  isDark || isEarth
                    ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                    : 'bg-white border-gray-200 hover:border-violet-200 hover:shadow-lg'
                )}
              >
                <div className={cn(
                  'inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br mb-4',
                  step.color
                )}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold text-violet-500 mb-2">{step.number}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Value Section */}
      <section className={cn(
        'py-20 md:py-28',
        isDark || isEarth ? 'bg-white/[0.02]' : 'bg-gray-50'
      )}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            SDKを入れるとできること
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-14 max-w-lg mx-auto">
            1行のコードで、すべてが動き出す
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sdkFeatures.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  'p-5 rounded-2xl border transition-all duration-300',
                  isDark || isEarth
                    ? 'bg-white/[0.03] border-white/[0.06] hover:border-violet-500/30'
                    : 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-md'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-violet-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-14">
            SDK導入 vs 未導入
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* With SDK */}
            <div className={cn(
              'p-6 rounded-2xl border-2 relative',
              isDark || isEarth
                ? 'bg-violet-500/5 border-violet-500/30'
                : 'bg-violet-50 border-violet-300'
            )}>
              <div className="absolute -top-3 left-6">
                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full">
                  推奨
                </span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="w-5 h-5 text-violet-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">SDK導入済み</h3>
              </div>
              <ul className="space-y-3">
                {withSdk.map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 px-4 py-3 rounded-xl bg-violet-500/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Verified by Toolverse</span>
                </div>
              </div>
            </div>

            {/* Without SDK */}
            <div className={cn(
              'p-6 rounded-2xl border',
              isDark || isEarth
                ? 'bg-white/[0.02] border-white/[0.06]'
                : 'bg-white border-gray-200'
            )}>
              <div className="flex items-center gap-2 mb-5">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">SDK未導入</h3>
              </div>
              <ul className="space-y-3">
                {withoutSdk.map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 px-4 py-3 rounded-xl bg-gray-500/10">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">External App</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                ※ SDKなしでも公開は可能です。いつでもSDKを追加できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={cn(
        'py-20 md:py-28',
        isDark || isEarth ? 'bg-white/[0.02]' : 'bg-gray-50'
      )}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            公開は自由。成功したいならSDKを入れろ。
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10">
            入口は完全に自由。成長・収益化はSDK前提。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="primary"
              className="gap-2 group text-[15px] px-8 py-4 rounded-2xl shadow-xl shadow-violet-500/15"
              onClick={() => router.push('/submit')}
            >
              SDKを使って公開する（推奨）
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 text-[15px] px-8 py-4 rounded-2xl"
              onClick={() => router.push('/docs/sdk')}
            >
              SDKドキュメントを見る
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
