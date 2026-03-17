'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import Button from '@/components/ui/Button';
import {
  Copy,
  Check,
  ArrowRight,
  Zap,
  LogIn,
  CreditCard,
  Link2,
  ShieldCheck,
  Code2,
  Paintbrush,
  Server,
  ChevronRight,
} from 'lucide-react';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      'relative rounded-xl border overflow-hidden',
      isDark || isEarth ? 'bg-[#0d0d1a] border-white/[0.06]' : 'bg-gray-900 border-gray-800'
    )}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-xs text-gray-500 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

export default function SdkDocsPage() {
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  const sections = [
    { id: 'quickstart', label: '最短導入', icon: Zap },
    { id: 'login', label: 'ログイン', icon: LogIn },
    { id: 'billing', label: '課金', icon: CreditCard },
    { id: 'external', label: '外部連携', icon: Link2 },
    { id: 'access', label: 'プラン判定', icon: ShieldCheck },
    { id: 'llm', label: 'LLMプロキシ', icon: Server },
    { id: 'errors', label: 'エラー処理', icon: ShieldCheck },
    { id: 'philosophy', label: '思想', icon: Code2 },
  ];

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Code2 className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">SDK Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Toolverse SDK
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            1行のコードで、ログイン・課金・ユーザー管理を自動化
          </p>
        </div>

        {/* Navigation */}
        <div className={cn(
          'flex flex-wrap gap-2 mb-12 p-2 rounded-xl',
          isDark || isEarth ? 'bg-white/[0.03]' : 'bg-gray-100'
        )}>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isDark || isEarth
                  ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white'
              )}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-16">
          {/* Section 1: Quick Start */}
          <section id="quickstart">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">最短導入</h2>
                <p className="text-sm text-gray-500">これだけでOK</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              npmまたはyarnでインストール後、以下のコードを追加するだけで利用開始できます。
            </p>

            <div className="space-y-4">
              <CodeBlock
                code="npm install @toolverse/sdk"
                language="bash"
              />
              <CodeBlock
                code={`import { initToolverse } from "@toolverse/sdk";

const toolverse = initToolverse({
  apiKey: "YOUR_API_KEY",
  // baseUrl: "https://toolverse.app" (default)
});`}
                language="typescript"
              />
            </div>

            <div className={cn(
              'mt-4 p-4 rounded-xl border',
              isDark || isEarth ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
            )}>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                <strong>これだけで完了。</strong>Toolverseの全機能が使えるようになります。
              </p>
            </div>
          </section>

          {/* Section 2: Login */}
          <section id="login">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ログイン</h2>
                <p className="text-sm text-gray-500">Googleログインを1行で実装</p>
              </div>
            </div>

            <div className="space-y-4">
              <CodeBlock
                code={`// ポップアップモード（デフォルト）
const user = await toolverse.loginWithGoogle();

// リダイレクトモード
await toolverse.loginWithGoogle({ mode: "redirect" });

// GitHubログイン
const user = await toolverse.loginWithGithub();`}
                language="typescript"
              />

              <CodeBlock
                code={`// 認証状態の確認
if (toolverse.isAuthenticated()) {
  const user = await toolverse.getUser();
  console.log(user.email);
  console.log(user.plan); // "free" | "pro" | "enterprise"
}

// ログアウト
toolverse.logout();`}
                language="typescript"
              />
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              ユーザーにGoogleまたはGitHubログインを表示し、認証完了後にToolverseがセッションを自動管理します。ポップアップ・リダイレクトの両方に対応。
            </p>
          </section>

          {/* Section 3: Billing */}
          <section id="billing">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">課金</h2>
                <p className="text-sm text-gray-500">サブスク・従量課金をすぐに導入</p>
              </div>
            </div>

            <div className="space-y-4">
              <CodeBlock
                code={`// サブスクリプション購入
await toolverse.openCheckout({
  planId: "pro_monthly",
});`}
                language="typescript"
              />

              <CodeBlock
                code={`// クレジットベース課金
const { balance } = await toolverse.getCredits();
console.log(\`残りクレジット: \${balance}\`);

// クレジット追加購入
const { url } = await toolverse.billing.purchaseCredits(10); // $10
window.location.href = url;`}
                language="typescript"
              />
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Stripeを裏側で自動連携。サブスクリプション・従量課金の両方に対応。決済フロー・請求・クレジット管理はすべてToolverseが処理します。
            </p>
          </section>

          {/* Section 4: External User Connection */}
          <section id="external">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">外部ログイン連携（任意）</h2>
                <p className="text-sm text-gray-500">既存の認証システムとの連携</p>
              </div>
            </div>

            <CodeBlock
              code={`toolverse.connectExternalUser({
  externalId: user.id,
  provider: "custom"
})`}
              language="typescript"
            />

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              既存のユーザーシステムがある場合、Toolverseアカウントと紐づけることで、シームレスな体験を提供できます。
            </p>
          </section>

          {/* Section 5: Access Check */}
          <section id="access">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">プラン判定</h2>
                <p className="text-sm text-gray-500">ユーザーのプランを即座に確認</p>
              </div>
            </div>

            <CodeBlock
              code={`const { hasAccess } = await toolverse.hasAccess("pro");

if (hasAccess) {
  // Pro機能を有効化
}`}
              language="typescript"
            />

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              ユーザーの課金状態をリアルタイムで取得。フリーミアムモデルの実装が簡単にできます。
            </p>
          </section>

          {/* Section 6: LLM Proxy */}
          <section id="llm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">LLMプロキシ（APIクレジット）</h2>
                <p className="text-sm text-gray-500">LLMリクエストをToolverse経由で送信</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Toolverseプロキシを通じてLLMリクエストを送信し、クレジットベースの課金・利用量追跡・プロバイダー抽象化を活用できます。
            </p>

            <div className="space-y-4">
              <CodeBlock
                code={`const response = await toolverse.callLLM({
  provider: "openai",
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain quantum computing." },
  ],
  maxTokens: 1024,
  temperature: 0.7,
});

console.log(response.content);
console.log(response.cost); // { raw, markupRate, total }`}
                language="typescript"
              />

              <CodeBlock
                code={`// Anthropic も同様に利用可能
const response = await toolverse.callLLM({
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  messages: [
    { role: "user", content: "Write a haiku about programming." },
  ],
  maxTokens: 256,
});`}
                language="typescript"
              />

              <CodeBlock
                code={`// ストリーミングモード
const stream = await toolverse.callLLM({
  provider: "openai",
  model: "gpt-4o",
  messages: [{ role: "user", content: "Tell me a story." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}`}
                language="typescript"
              />
            </div>
          </section>

          {/* Section 7: Error Handling */}
          <section id="errors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">エラー処理</h2>
                <p className="text-sm text-gray-500">型付きエラーで精密なハンドリング</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              SDKは型付きエラークラスをエクスポートしています。エラーの種類に応じた適切な処理が可能です。
            </p>

            <CodeBlock
              code={`import {
  ToolverseError,
  AuthError,
  InsufficientCreditsError,
  PlanRequiredError,
} from "@toolverse/sdk";

try {
  await toolverse.callLLM({ /* ... */ });
} catch (err) {
  if (err instanceof InsufficientCreditsError) {
    // クレジット購入を促す
    const { url } = await toolverse.billing.purchaseCredits(10);
    window.location.href = url;
  } else if (err instanceof AuthError) {
    // 未認証 → ログインへ
    await toolverse.loginWithGoogle();
  } else if (err instanceof PlanRequiredError) {
    // プランアップグレードが必要
    await toolverse.openCheckout({ planId: err.requiredPlan });
  }
}`}
              language="typescript"
            />
          </section>

          {/* Section 8: Philosophy */}
          <section id="philosophy">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Paintbrush className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">設計思想</h2>
                <p className="text-sm text-gray-500">SDKの哲学</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Paintbrush,
                  title: 'UIは自由',
                  desc: 'デザインは完全にあなた次第。SDKはUIに干渉しません。',
                  color: 'text-pink-500',
                  bg: 'bg-pink-500/10',
                },
                {
                  icon: Code2,
                  title: 'SDKだけ入れればOK',
                  desc: 'バックエンド構築不要。1行で全機能が動く。',
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-500/10',
                },
                {
                  icon: Server,
                  title: 'Toolverseは裏側で動く',
                  desc: '認証・課金・分析をバックグラウンドで処理。',
                  color: 'text-violet-500',
                  bg: 'bg-violet-500/10',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    'p-5 rounded-xl border',
                    isDark || isEarth
                      ? 'bg-white/[0.03] border-white/[0.06]'
                      : 'bg-white border-gray-200'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', item.bg)}>
                    <item.icon className={cn('w-5 h-5', item.color)} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className={cn(
          'mt-20 p-8 rounded-2xl border text-center',
          isDark || isEarth
            ? 'bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/20'
            : 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200'
        )}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            準備はできましたか？
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            SDKを追加して、今すぐアプリを公開しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="primary"
              className="gap-2 group rounded-2xl"
              onClick={() => router.push('/submit')}
            >
              アプリを公開する
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 rounded-2xl"
              onClick={() => router.push('/creators')}
            >
              クリエイターページへ
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
