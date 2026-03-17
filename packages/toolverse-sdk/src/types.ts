export interface ToolverseConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ResolvedToolverseConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ToolverseUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface CheckoutOptions {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface AccessResult {
  hasAccess: boolean;
  reason?: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresAt: number;
}

export interface CreditBalance {
  balance: number;
  currency: string;
}

export interface LLMRequestOptions {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  finishReason: string;
  usage: { inputTokens: number; outputTokens: number };
  cost: { raw: number; markupRate: number; total: number };
  durationMs: number;
}

export interface LoginOptions {
  mode?: 'popup' | 'redirect';
}
