'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Upload,
  Globe,
  FileText,
  Key,
  Rocket,
} from 'lucide-react';

type Step = 1 | 2 | 3;
type SdkChoice = 'yes' | 'no' | null;
type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function SubmitPage() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const [step, setStep] = useState<Step>(1);
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [sdkChoice, setSdkChoice] = useState<SdkChoice>(null);
  const [apiKey, setApiKey] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const canProceedStep1 = appName.trim() && appUrl.trim() && appDesc.trim();
  const canProceedStep2 = sdkChoice !== null && (sdkChoice === 'no' || verifyStatus === 'success');

  const handleVerify = async () => {
    if (!apiKey.trim()) return;
    setVerifyStatus('verifying');
    // Simulate SDK verification
    await new Promise((r) => setTimeout(r, 2000));
    setVerifyStatus('success');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publish
    await new Promise((r) => setTimeout(r, 2000));
    setIsPublishing(false);
    setIsPublished(true);
  };

  const inputClasses = cn(
    'w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none',
    isDark || isEarth
      ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:bg-white/[0.07]'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10'
  );

  if (isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">公開完了！</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            「{appName}」が{sdkChoice === 'yes' ? 'Verified App' : 'External App'}として掲載されました。
          </p>
          {sdkChoice === 'yes' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mt-4">
              <ShieldCheck className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Verified by Toolverse</span>
            </div>
          )}
          {sdkChoice === 'no' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-500/10 border border-gray-500/20 mt-4">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">External App</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            アプリを公開
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Toolverseにアプリを掲載しましょう
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  step >= s
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    : isDark || isEarth
                    ? 'bg-white/[0.06] text-gray-500'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    'w-12 h-0.5 rounded-full transition-all',
                    step > s
                      ? 'bg-violet-500'
                      : isDark || isEarth
                      ? 'bg-white/[0.06]'
                      : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={cn(
          'p-6 sm:p-8 rounded-2xl border',
          isDark || isEarth
            ? 'bg-white/[0.03] border-white/[0.06]'
            : 'bg-white border-gray-200 shadow-sm'
        )}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">基本情報</h2>
                  <p className="text-sm text-gray-500">アプリの基本情報を入力してください</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  アプリ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="例: AI Writing Assistant"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://your-app.com"
                    className={cn(inputClasses, 'pl-10')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={appDesc}
                  onChange={(e) => setAppDesc(e.target.value)}
                  placeholder="アプリの概要を簡潔に記述してください"
                  rows={4}
                  className={cn(inputClasses, 'resize-none')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="md"
                  variant="primary"
                  className="gap-2 rounded-xl"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  次へ
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: SDK Check */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">SDK導入チェック</h2>
                  <p className="text-sm text-gray-500">Toolverse SDKは導入されていますか？</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Yes option */}
                <button
                  onClick={() => {
                    setSdkChoice('yes');
                    setVerifyStatus('idle');
                  }}
                  className={cn(
                    'p-5 rounded-xl border-2 text-left transition-all duration-200',
                    sdkChoice === 'yes'
                      ? 'border-violet-500 bg-violet-500/5'
                      : isDark || isEarth
                      ? 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                      : 'border-gray-200 hover:border-violet-200 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-violet-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">はい（推奨）</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ランキング・レコメンド・課金連携が有効に
                  </p>
                </button>

                {/* No option */}
                <button
                  onClick={() => {
                    setSdkChoice('no');
                    setVerifyStatus('idle');
                    setApiKey('');
                  }}
                  className={cn(
                    'p-5 rounded-xl border-2 text-left transition-all duration-200',
                    sdkChoice === 'no'
                      ? 'border-gray-400 bg-gray-500/5'
                      : isDark || isEarth
                      ? 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">いいえ（制限あり）</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    External Appとして掲載されます
                  </p>
                </button>
              </div>

              {/* SDK Yes: API Key verification */}
              {sdkChoice === 'yes' && (
                <div className={cn(
                  'p-5 rounded-xl border',
                  isDark || isEarth ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'
                )}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    APIキー
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setVerifyStatus('idle');
                      }}
                      placeholder="tv_xxxxxxxxxxxxxxxx"
                      className={cn(inputClasses, 'flex-1')}
                      disabled={verifyStatus === 'success'}
                    />
                    <Button
                      size="md"
                      variant={verifyStatus === 'success' ? 'secondary' : 'primary'}
                      className="rounded-xl whitespace-nowrap"
                      disabled={!apiKey.trim() || verifyStatus === 'verifying' || verifyStatus === 'success'}
                      onClick={handleVerify}
                    >
                      {verifyStatus === 'verifying' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {verifyStatus === 'success' && <Check className="w-4 h-4" />}
                      {verifyStatus === 'idle' && '接続テスト'}
                      {verifyStatus === 'verifying' && '確認中...'}
                      {verifyStatus === 'success' && 'Verified'}
                      {verifyStatus === 'error' && '再試行'}
                    </Button>
                  </div>
                  {verifyStatus === 'success' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-500">
                      <ShieldCheck className="w-4 h-4" />
                      SDK接続が確認されました
                    </div>
                  )}
                </div>
              )}

              {/* SDK No: Warning */}
              {sdkChoice === 'no' && (
                <div className={cn(
                  'p-5 rounded-xl border',
                  isDark || isEarth ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      このアプリはExternal Appとして掲載されます
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      ランキング対象外
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      課金連携なし
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      トラフィック優遇なし
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-400">
                    ※ いつでもSDKを追加してVerified Appにアップグレードできます
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  size="md"
                  variant="ghost"
                  className="gap-2 rounded-xl"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  className="gap-2 rounded-xl"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  次へ
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Publish */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">公開確認</h2>
                  <p className="text-sm text-gray-500">内容を確認して公開しましょう</p>
                </div>
              </div>

              {/* Summary */}
              <div className={cn(
                'p-5 rounded-xl border space-y-4',
                isDark || isEarth ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              )}>
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">アプリ名</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{appName}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">URL</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{appUrl}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">説明</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{appDesc}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">ステータス</div>
                  {sdkChoice === 'yes' ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Verified by Toolverse</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/20">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">External App</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  size="md"
                  variant="ghost"
                  className="gap-2 rounded-xl"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  className="gap-2 rounded-xl"
                  isLoading={isPublishing}
                  onClick={handlePublish}
                >
                  <Upload className="w-4 h-4" />
                  公開する
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
