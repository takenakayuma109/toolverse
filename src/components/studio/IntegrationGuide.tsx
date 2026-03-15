'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import {
  Shield,
  CreditCard,
  HeartPulse,
  Webhook,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// ── Code Snippets ──

const SSO_EXCHANGE_CODE = `// 1. User arrives at your app from Toolverse with query params:
//    https://your-app.com/auth/callback?tv_code=abc123&tv_state=xyz789

app.get('/auth/callback', async (req, res) => {
  const { tv_code, tv_state } = req.query;

  // 2. Exchange the code for an access token
  const tokenRes = await fetch('https://api.toolverse.app/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: tv_code,
      client_id: process.env.TOOLVERSE_CLIENT_ID,
      client_secret: process.env.TOOLVERSE_CLIENT_SECRET,
      redirect_uri: 'https://your-app.com/auth/callback',
    }),
  });

  const { access_token, refresh_token, expires_in } = await tokenRes.json();

  // 3. Fetch the authenticated user's profile
  const userRes = await fetch('https://api.toolverse.app/api/oauth/userinfo', {
    headers: { Authorization: \`Bearer \${access_token}\` },
  });

  const user = await userRes.json();
  // user = { id, email, name, avatar, locale, ... }

  // 4. Create a session in your app
  req.session.user = user;
  req.session.accessToken = access_token;
  res.redirect('/dashboard');
});`;

const PAYMENT_CHECK_CODE = `// Middleware: verify user has paid for your tool
async function requireAccess(req, res, next) {
  const userId = req.session.user?.id;
  const toolId = process.env.TOOLVERSE_TOOL_ID;

  const accessRes = await fetch(
    \`https://api.toolverse.app/api/tools/\${toolId}/access?userId=\${userId}\`,
    {
      headers: {
        Authorization: \`Bearer \${process.env.TOOLVERSE_API_KEY}\`,
      },
    }
  );

  const { hasAccess, subscription } = await accessRes.json();
  // subscription = { plan, status, expiresAt, ... }

  if (!hasAccess) {
    return res.status(403).json({
      error: 'subscription_required',
      message: 'Please subscribe via Toolverse to access this app.',
    });
  }

  req.subscription = subscription;
  next();
}

// Apply to protected routes
app.use('/api/*', requireAccess);`;

const HEALTH_CHECK_CODE = `// Serve at GET /.well-known/toolverse.json
// Toolverse pings this endpoint every 15 minutes

app.get('/.well-known/toolverse.json', (req, res) => {
  res.json({
    name: 'My App',
    version: '1.0.0',
    status: 'ok',
  });
});`;

const HEALTH_CHECK_RESPONSE = `{
  "name": "My App",
  "version": "1.0.0",
  "status": "ok"
}`;

const WEBHOOK_VERIFY_CODE = `import crypto from 'crypto';

// Webhook events: user.subscribed, user.unsubscribed, payment.completed
app.post('/webhooks/toolverse', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-toolverse-signature'];
  const timestamp = req.headers['x-toolverse-timestamp'];
  const body = req.body;

  // 1. Verify the HMAC-SHA256 signature
  const expected = crypto
    .createHmac('sha256', process.env.TOOLVERSE_WEBHOOK_SECRET)
    .update(\`\${timestamp}.\${body}\`)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Prevent replay attacks (reject if older than 5 min)
  const age = Date.now() - parseInt(timestamp, 10);
  if (age > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'Timestamp too old' });
  }

  // 3. Handle the event
  const event = JSON.parse(body);

  switch (event.type) {
    case 'user.subscribed':
      // Grant access to the user
      grantAccess(event.data.userId, event.data.plan);
      break;
    case 'user.unsubscribed':
      // Revoke access
      revokeAccess(event.data.userId);
      break;
    case 'payment.completed':
      // Record the payment
      recordPayment(event.data);
      break;
  }

  res.json({ received: true });
});`;

const WEBHOOK_PAYLOAD_EXAMPLE = `// Example: user.subscribed event payload
{
  "id": "evt_a1b2c3d4",
  "type": "user.subscribed",
  "timestamp": 1710500000000,
  "data": {
    "userId": "usr_x1y2z3",
    "toolId": "tool_abc123",
    "plan": "pro",
    "interval": "monthly",
    "amount": 980,
    "currency": "JPY"
  }
}`;

// ── Sub-components ──

type IntegrationTab = 'sso' | 'payment' | 'health' | 'webhooks';

function CodeBlock({ code, id, copiedId, onCopy, label }: {
  code: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  label?: string;
}) {
  return (
    <div className="relative">
      {label && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="relative group">
        <pre className="p-4 rounded-xl bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs overflow-x-auto max-h-96 overflow-y-auto leading-relaxed pr-14 font-mono">
          <code>{code}</code>
        </pre>
        <button
          onClick={() => onCopy(code, id)}
          className="absolute right-3 top-3 p-2 rounded-lg hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Copy code"
        >
          {copiedId === id ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function EndpointBadge({ method, path }: { method: string; path: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 font-mono text-sm">
      <span className={cn('px-2 py-0.5 rounded text-xs font-bold uppercase', colors[method] || 'bg-gray-100 text-gray-700')}>
        {method}
      </span>
      <span className="text-gray-700 dark:text-gray-300">{path}</span>
    </div>
  );
}

// ── Sections ──

function SSOSection({ copiedId, onCopy, t }: { copiedId: string | null; onCopy: (t: string, id: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('studio.integration.sso.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('studio.integration.sso.description')}
        </p>
      </div>

      {/* Flow overview */}
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { step: '1', titleKey: 'studio.integration.sso.step1', descKey: 'studio.integration.sso.step1Desc' },
          { step: '2', titleKey: 'studio.integration.sso.step2', descKey: 'studio.integration.sso.step2Desc' },
          { step: '3', titleKey: 'studio.integration.sso.step3', descKey: 'studio.integration.sso.step3Desc' },
          { step: '4', titleKey: 'studio.integration.sso.step4', descKey: 'studio.integration.sso.step4Desc' },
        ].map((s) => (
          <div key={s.step} className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">
              {s.step}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{t(s.titleKey)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(s.descKey)}</p>
          </div>
        ))}
      </div>

      {/* API endpoints */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('studio.integration.endpoints')}</p>
        <div className="flex flex-wrap gap-2">
          <EndpointBadge method="POST" path="/api/oauth/token" />
          <EndpointBadge method="GET" path="/api/oauth/userinfo" />
        </div>
      </div>

      {/* Code example */}
      <Collapsible title={t('studio.integration.codeExample') + ' (Node.js / Express)'} defaultOpen>
        <CodeBlock code={SSO_EXCHANGE_CODE} id="sso-code" copiedId={copiedId} onCopy={onCopy} />
      </Collapsible>
    </div>
  );
}

function PaymentSection({ copiedId, onCopy, t }: { copiedId: string | null; onCopy: (t: string, id: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('studio.integration.payment.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('studio.integration.payment.description')}
        </p>
      </div>

      {/* Endpoint */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('studio.integration.endpoints')}</p>
        <EndpointBadge method="GET" path="/api/tools/{toolId}/access?userId={userId}" />
      </div>

      {/* Response shape */}
      <Collapsible title={t('studio.integration.payment.responseShape')} defaultOpen>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('studio.integration.payment.responseDesc')}
          </p>
          <CodeBlock
            code={`{
  "hasAccess": true,
  "subscription": {
    "plan": "pro",
    "status": "active",
    "expiresAt": "2026-04-15T00:00:00Z",
    "interval": "monthly"
  }
}`}
            id="payment-response"
            copiedId={copiedId}
            onCopy={onCopy}
          />
        </div>
      </Collapsible>

      {/* Middleware example */}
      <Collapsible title={t('studio.integration.codeExample') + ' (Node.js / Express)'} defaultOpen>
        <CodeBlock code={PAYMENT_CHECK_CODE} id="payment-code" copiedId={copiedId} onCopy={onCopy} />
      </Collapsible>
    </div>
  );
}

function HealthCheckSection({ copiedId, onCopy, t }: { copiedId: string | null; onCopy: (t: string, id: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('studio.integration.health.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('studio.integration.health.description')}
        </p>
      </div>

      {/* Endpoint */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('studio.integration.endpoints')}</p>
        <EndpointBadge method="GET" path="/.well-known/toolverse.json" />
      </div>

      {/* Required response */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
          {t('studio.integration.health.requirement')}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {t('studio.integration.health.requirementDesc')}
        </p>
      </div>

      {/* Expected response */}
      <Collapsible title={t('studio.integration.health.expectedResponse')} defaultOpen>
        <CodeBlock code={HEALTH_CHECK_RESPONSE} id="health-response" copiedId={copiedId} onCopy={onCopy} />
      </Collapsible>

      {/* Code example */}
      <Collapsible title={t('studio.integration.codeExample') + ' (Node.js / Express)'}>
        <CodeBlock code={HEALTH_CHECK_CODE} id="health-code" copiedId={copiedId} onCopy={onCopy} />
      </Collapsible>
    </div>
  );
}

function WebhooksSection({ copiedId, onCopy, t }: { copiedId: string | null; onCopy: (t: string, id: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('studio.integration.webhooks.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('studio.integration.webhooks.description')}
        </p>
      </div>

      {/* Events table */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('studio.integration.webhooks.availableEvents')}
        </p>
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('studio.integration.webhooks.event')}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('studio.integration.webhooks.trigger')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { event: 'user.subscribed', triggerKey: 'studio.integration.webhooks.triggerSubscribed' },
                { event: 'user.unsubscribed', triggerKey: 'studio.integration.webhooks.triggerUnsubscribed' },
                { event: 'payment.completed', triggerKey: 'studio.integration.webhooks.triggerPayment' },
              ].map((row) => (
                <tr key={row.event}>
                  <td className="px-4 py-3">
                    <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-violet-600 dark:text-violet-400 text-xs font-mono">
                      {row.event}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                    {t(row.triggerKey)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security info */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
          {t('studio.integration.webhooks.security')}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          {t('studio.integration.webhooks.securityDesc')}
        </p>
      </div>

      {/* Payload example */}
      <Collapsible title={t('studio.integration.webhooks.payloadExample')} defaultOpen>
        <CodeBlock code={WEBHOOK_PAYLOAD_EXAMPLE} id="webhook-payload" copiedId={copiedId} onCopy={onCopy} />
      </Collapsible>

      {/* Verification code */}
      <Collapsible title={t('studio.integration.webhooks.verificationCode') + ' (Node.js / Express)'} defaultOpen>
        <CodeBlock code={WEBHOOK_VERIFY_CODE} id="webhook-code" copiedId={copiedId} onCopy={onCopy} />
      </Collapsible>
    </div>
  );
}

// ── Main Component ──

const TABS: { id: IntegrationTab; labelKey: string; icon: typeof Shield }[] = [
  { id: 'sso', labelKey: 'studio.integration.tabs.sso', icon: Shield },
  { id: 'payment', labelKey: 'studio.integration.tabs.payment', icon: CreditCard },
  { id: 'health', labelKey: 'studio.integration.tabs.health', icon: HeartPulse },
  { id: 'webhooks', labelKey: 'studio.integration.tabs.webhooks', icon: Webhook },
];

export default function IntegrationGuide() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<IntegrationTab>('sso');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('studio.integration.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('studio.integration.subtitle')}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/50 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card padding="lg">
        {activeTab === 'sso' && <SSOSection copiedId={copiedId} onCopy={copyCode} t={t} />}
        {activeTab === 'payment' && <PaymentSection copiedId={copiedId} onCopy={copyCode} t={t} />}
        {activeTab === 'health' && <HealthCheckSection copiedId={copiedId} onCopy={copyCode} t={t} />}
        {activeTab === 'webhooks' && <WebhooksSection copiedId={copiedId} onCopy={copyCode} t={t} />}
      </Card>
    </div>
  );
}
