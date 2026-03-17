// Core client
import { ToolverseClient as _ToolverseClient } from './client';
export { ToolverseClient } from './client';

// Auth module
export { ToolverseAuth, handleOAuthCallbackPage } from './auth';

// Billing module
export { ToolverseBilling } from './billing';

// Storage
export { TokenStorage } from './storage';

// Errors
export {
  ToolverseError,
  AuthError,
  InsufficientCreditsError,
  NetworkError,
  ApiError,
} from './errors';

// Types
export type {
  ToolverseConfig,
  ResolvedToolverseConfig,
  ToolverseUser,
  CheckoutOptions,
  AccessResult,
  AuthTokens,
  CreditBalance,
  LLMRequestOptions,
  LLMResponse,
  LoginOptions,
} from './types';

// Utilities
export { buildUrl, generateState, generateCodeVerifier } from './utils';

/**
 * Convenience factory for creating a ToolverseClient instance.
 *
 * @example
 * ```ts
 * import { initToolverse } from '@toolverse/sdk';
 *
 * const toolverse = initToolverse({ apiKey: 'tv_...' });
 * const user = await toolverse.loginWithGoogle();
 * ```
 */
export function initToolverse(
  config: import('./types').ToolverseConfig,
): _ToolverseClient {
  return new _ToolverseClient(config);
}
