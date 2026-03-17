# @toolverse/sdk

Official SDK for integrating your app with [Toolverse](https://toolverse.app).

Toolverse handles authentication, billing, and user management so you can focus on building your product. Drop in the SDK and get login, payments, plan gating, and LLM proxy access with just a few lines of code.

## Installation

```bash
npm install @toolverse/sdk
```

or

```bash
yarn add @toolverse/sdk
```

## Quick Start

```typescript
import { initToolverse } from '@toolverse/sdk';

const toolverse = initToolverse({
  apiKey: 'your-api-key',
  // baseUrl: 'https://toolverse.app' (default)
});

// Login user
const user = await toolverse.loginWithGoogle();

// Check access
const { hasAccess } = await toolverse.hasAccess('pro');

// Open checkout
await toolverse.openCheckout({ planId: 'pro' });

// Get credit balance
const { balance } = await toolverse.getCredits();

// Call LLM via Toolverse proxy
const response = await toolverse.callLLM({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Authentication

The SDK supports OAuth2 login via popup or redirect.

### Popup Mode (default)

```typescript
const user = await toolverse.loginWithGoogle();
console.log(user.email); // user's email
console.log(user.id);    // Toolverse user ID
```

### Redirect Mode

```typescript
await toolverse.loginWithGoogle({ mode: 'redirect' });
```

### GitHub Login

```typescript
const user = await toolverse.loginWithGithub();
```

### Auth State

```typescript
// Check if user is logged in
if (toolverse.isAuthenticated()) {
  const user = await toolverse.getUser();
  console.log(user.email);
  console.log(user.plan); // 'free' | 'pro' | 'enterprise'
}

// Logout
toolverse.logout();
```

### Connect External Users

If you already have your own auth system, link your users to Toolverse accounts:

```typescript
toolverse.connectExternalUser({
  externalId: user.id,
  provider: 'custom',
});
```

## Billing

Toolverse integrates with Stripe behind the scenes. No backend setup required.

### Subscription Checkout

```typescript
// Open a Stripe-powered checkout for a subscription plan
await toolverse.openCheckout({ planId: 'pro_monthly' });
```

### Plan Access Check

```typescript
const { hasAccess } = await toolverse.hasAccess('pro');

if (hasAccess) {
  // Enable pro features
}
```

### Credit-Based Billing

```typescript
// Get current credit balance
const { balance } = await toolverse.getCredits();
console.log(`Credits remaining: ${balance}`);

// Purchase more credits
const { url } = await toolverse.billing.purchaseCredits(10); // $10
window.location.href = url;
```

## LLM Proxy (API Credits)

Route LLM requests through Toolverse to leverage credit-based billing, usage tracking, and provider abstraction.

### OpenAI

```typescript
const response = await toolverse.callLLM({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing.' },
  ],
  maxTokens: 1024,
  temperature: 0.7,
});

console.log(response.content);
console.log(response.usage);  // { promptTokens, completionTokens, totalTokens }
console.log(response.cost);   // { raw, markupRate, total }
```

### Anthropic

```typescript
const response = await toolverse.callLLM({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  messages: [
    { role: 'user', content: 'Write a haiku about programming.' },
  ],
  maxTokens: 256,
});
```

### Streaming

```typescript
const stream = await toolverse.callLLM({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story.' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

## Error Handling

The SDK exports typed error classes for precise error handling.

```typescript
import {
  ToolverseError,
  AuthError,
  InsufficientCreditsError,
  PlanRequiredError,
  RateLimitError,
} from '@toolverse/sdk';

try {
  await toolverse.callLLM({ ... });
} catch (err) {
  if (err instanceof InsufficientCreditsError) {
    // Prompt user to buy credits
    const { url } = await toolverse.billing.purchaseCredits(10);
    window.location.href = url;
  } else if (err instanceof AuthError) {
    // User is not authenticated
    await toolverse.loginWithGoogle();
  } else if (err instanceof PlanRequiredError) {
    // User needs a higher plan
    await toolverse.openCheckout({ planId: err.requiredPlan });
  } else if (err instanceof RateLimitError) {
    // Too many requests, retry after delay
    console.log(`Retry after ${err.retryAfter}ms`);
  }
}
```

## Configuration

```typescript
const toolverse = initToolverse({
  // Required: your API key from the Toolverse dashboard
  apiKey: 'tv_live_xxxxxxxxxxxx',

  // Optional: override the base URL (useful for self-hosted or staging)
  baseUrl: 'https://toolverse.app',

  // Optional: login popup behavior
  popupMode: 'popup', // 'popup' | 'redirect'

  // Optional: auto-refresh auth tokens
  autoRefresh: true,

  // Optional: custom logger
  logger: console,
});
```

## API Reference

### `initToolverse(config)`

Initialize the SDK. Returns a `Toolverse` instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `string` | Yes | Your Toolverse API key |
| `baseUrl` | `string` | No | API base URL (default: `https://toolverse.app`) |
| `popupMode` | `'popup' \| 'redirect'` | No | Default auth mode |
| `autoRefresh` | `boolean` | No | Auto-refresh tokens (default: `true`) |

### `toolverse.loginWithGoogle(options?)`

Authenticate the user via Google OAuth. Returns a `User` object.

### `toolverse.loginWithGithub(options?)`

Authenticate the user via GitHub OAuth. Returns a `User` object.

### `toolverse.getUser()`

Get the currently authenticated user. Returns `User | null`.

### `toolverse.isAuthenticated()`

Check if a user is currently logged in. Returns `boolean`.

### `toolverse.logout()`

Log out the current user and clear the session.

### `toolverse.connectExternalUser(options)`

Link an external user ID to the Toolverse account.

### `toolverse.openCheckout(options)`

Open a Stripe checkout session for the specified plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `planId` | `string` | Yes | The plan identifier (e.g., `'pro_monthly'`) |
| `successUrl` | `string` | No | Redirect URL after successful payment |
| `cancelUrl` | `string` | No | Redirect URL if user cancels |

### `toolverse.hasAccess(planId)`

Check if the user has access to the specified plan. Returns `{ hasAccess: boolean }`.

### `toolverse.getCredits()`

Get the current user's credit balance. Returns `{ balance: number }`.

### `toolverse.callLLM(options)`

Call an LLM provider through the Toolverse proxy.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `provider` | `'openai' \| 'anthropic'` | Yes | LLM provider |
| `model` | `string` | Yes | Model identifier |
| `messages` | `Message[]` | Yes | Chat messages array |
| `maxTokens` | `number` | No | Maximum tokens in response |
| `temperature` | `number` | No | Sampling temperature (0-2) |
| `stream` | `boolean` | No | Enable streaming response |

### `toolverse.billing.purchaseCredits(amount)`

Generate a checkout URL for purchasing credits. Returns `{ url: string }`.

## License

MIT
