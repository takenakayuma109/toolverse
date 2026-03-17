import type {
  CheckoutOptions,
  LoginOptions,
  LLMRequestOptions,
  LLMResponse,
  ResolvedToolverseConfig,
  ToolverseConfig,
  ToolverseUser,
  AccessResult,
  CreditBalance,
} from './types';
import { ToolverseAuth } from './auth';
import { ToolverseBilling } from './billing';
import { TokenStorage } from './storage';

const DEFAULT_BASE_URL = 'https://toolverse.app';

export class ToolverseClient {
  public readonly auth: ToolverseAuth;
  public readonly billing: ToolverseBilling;

  private config: ResolvedToolverseConfig;
  private storage: TokenStorage;

  constructor(config: ToolverseConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    };

    this.storage = new TokenStorage();

    this.auth = new ToolverseAuth(
      this.config.baseUrl,
      this.config.apiKey,
      this.storage,
    );

    this.billing = new ToolverseBilling(
      this.config.baseUrl,
      () => this.auth.getAccessToken(),
    );
  }

  // ---------------------------------------------------------------------------
  // Auth convenience methods
  // ---------------------------------------------------------------------------

  async loginWithGoogle(options?: LoginOptions): Promise<ToolverseUser> {
    return this.auth.login('google', options);
  }

  async loginWithGithub(options?: LoginOptions): Promise<ToolverseUser> {
    return this.auth.login('github', options);
  }

  async getUser(): Promise<ToolverseUser | null> {
    return this.auth.getUser();
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  logout(): void {
    this.auth.logout();
  }

  // ---------------------------------------------------------------------------
  // Billing convenience methods
  // ---------------------------------------------------------------------------

  async openCheckout(options: CheckoutOptions): Promise<void> {
    return this.billing.openCheckout(options);
  }

  async hasAccess(planId: string): Promise<AccessResult> {
    return this.billing.hasAccess(planId);
  }

  async getCredits(): Promise<CreditBalance> {
    return this.billing.getCredits();
  }

  async callLLM(options: LLMRequestOptions): Promise<LLMResponse> {
    return this.billing.callLLM(options);
  }
}
