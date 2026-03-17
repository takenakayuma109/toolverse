import type {
  AccessResult,
  CheckoutOptions,
  CreditBalance,
  LLMRequestOptions,
  LLMResponse,
} from './types';
import {
  ApiError,
  AuthError,
  InsufficientCreditsError,
  NetworkError,
} from './errors';
import { buildUrl } from './utils';

export class ToolverseBilling {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  /**
   * Open a Stripe Checkout session for a tool/plan purchase.
   * Redirects the browser to the Stripe-hosted checkout page.
   */
  async openCheckout(options: CheckoutOptions): Promise<void> {
    const token = this.requireToken();
    const url = buildUrl(this.baseUrl, `/api/tools/${options.planId}/purchase`);

    const body: Record<string, string> = { priceType: 'one_time' };
    if (options.successUrl) body.successUrl = options.successUrl;
    if (options.cancelUrl) body.cancelUrl = options.cancelUrl;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await this.parseResponse<{ url: string }>(response);

    if (!data.url) {
      throw new ApiError('No checkout URL returned from server', 500);
    }

    window.location.href = data.url;
  }

  /**
   * Check whether the current user has access to a given plan or feature.
   */
  async hasAccess(planId: string): Promise<AccessResult> {
    const token = this.requireToken();
    const url = buildUrl(this.baseUrl, `/api/tools/${planId}/access`);

    const response = await this.fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.parseResponse<AccessResult>(response);
  }

  /**
   * Get the current user's credit balance.
   */
  async getCredits(): Promise<CreditBalance> {
    const token = this.requireToken();
    const url = buildUrl(this.baseUrl, '/api/billing/credits');

    const response = await this.fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.parseResponse<CreditBalance>(response);
  }

  /**
   * Initiate a credit purchase. Returns a URL to a Stripe Checkout session.
   */
  async purchaseCredits(amount: number): Promise<{ url: string }> {
    const token = this.requireToken();
    const url = buildUrl(this.baseUrl, '/api/billing/credits');

    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    return this.parseResponse<{ url: string }>(response);
  }

  /**
   * Call an LLM through the Toolverse proxy.
   * Credits are deducted automatically based on token usage.
   */
  async callLLM(options: LLMRequestOptions): Promise<LLMResponse> {
    const token = this.requireToken();
    const url = buildUrl(this.baseUrl, '/api/proxy/llm');

    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: options.provider,
        model: options.model,
        messages: options.messages,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      }),
    });

    if (response.status === 402) {
      throw new InsufficientCreditsError();
    }

    return this.parseResponse<LLMResponse>(response);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private requireToken(): string {
    const token = this.getToken();
    if (!token) {
      throw new AuthError(
        'Not authenticated. Please log in before making billing requests.',
      );
    }
    return token;
  }

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
    try {
      return await globalThis.fetch(url, init);
    } catch (err) {
      throw new NetworkError(
        `Network request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 402) {
      throw new InsufficientCreditsError();
    }

    if (!response.ok) {
      let message: string;
      try {
        const body = await response.json();
        message = body.error ?? body.message ?? response.statusText;
      } catch {
        message = response.statusText;
      }
      throw new ApiError(message, response.status);
    }

    return (await response.json()) as T;
  }
}
