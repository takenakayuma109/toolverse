import type { AuthTokens, LoginOptions, ToolverseUser } from './types';
import { AuthError, ApiError, NetworkError } from './errors';
import { TokenStorage } from './storage';
import { buildUrl, generateState } from './utils';

const STATE_KEY = 'toolverse_oauth_state';
const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const CALLBACK_PATH = '/toolverse-callback';

export class ToolverseAuth {
  private baseUrl: string;
  private apiKey: string;
  private storage: TokenStorage;

  constructor(baseUrl: string, apiKey: string, storage: TokenStorage) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.storage = storage;
  }

  /**
   * Login with Google OAuth.
   */
  async loginWithGoogle(options?: LoginOptions): Promise<ToolverseUser> {
    return this.login('google', options);
  }

  /**
   * Login with GitHub OAuth.
   */
  async loginWithGithub(options?: LoginOptions): Promise<ToolverseUser> {
    return this.login('github', options);
  }

  /**
   * Generic OAuth login for any supported provider.
   */
  async login(
    provider: 'google' | 'github',
    options?: LoginOptions,
  ): Promise<ToolverseUser> {
    const mode = options?.mode ?? 'popup';

    const state = generateState();
    this.storeState(state);

    const redirectUri =
      mode === 'popup'
        ? `${window.location.origin}${CALLBACK_PATH}`
        : window.location.href.split('?')[0];

    const authorizeUrl = buildUrl(
      this.baseUrl,
      '/api/oauth/authorize',
      {
        client_id: this.apiKey,
        redirect_uri: redirectUri,
        response_type: 'code',
        state,
        provider,
      },
    );

    if (mode === 'popup') {
      return this.loginWithPopup(authorizeUrl);
    }

    // Redirect mode: navigate away; the app should call handleCallback() on return
    window.location.href = authorizeUrl;
    // This promise won't resolve in redirect mode — the page navigates away
    return new Promise(() => {});
  }

  /**
   * Handle the OAuth callback after redirect mode.
   * Call this on page load to check for auth codes in the URL.
   */
  async handleCallback(code: string, state: string): Promise<ToolverseUser> {
    const storedState = this.retrieveState();
    if (!storedState || storedState !== state) {
      throw new AuthError(
        'OAuth state mismatch — possible CSRF attack. Please try logging in again.',
      );
    }

    this.clearState();

    const tokens = await this.exchangeCodeForToken(code);
    this.storage.setTokens(tokens);

    const user = await this.fetchUserInfo(tokens.accessToken);
    this.storage.setUser(user);

    return user;
  }

  /**
   * Get the current user from cache, or fetch from the API if a valid token exists.
   */
  async getUser(): Promise<ToolverseUser | null> {
    const cached = this.storage.getUser();
    if (cached) return cached;

    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const user = await this.fetchUserInfo(token);
      this.storage.setUser(user);
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Check whether the user is currently authenticated with a valid (non-expired) token.
   */
  isAuthenticated(): boolean {
    return this.storage.getTokens() !== null;
  }

  /**
   * Log out by clearing all stored tokens and user data.
   */
  logout(): void {
    this.storage.clearAll();
  }

  /**
   * Get the current access token, or null if not authenticated / expired.
   */
  getAccessToken(): string | null {
    const tokens = this.storage.getTokens();
    return tokens?.accessToken ?? null;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private loginWithPopup(authorizeUrl: string): Promise<ToolverseUser> {
    return new Promise<ToolverseUser>((resolve, reject) => {
      const left = Math.round(
        (window.screen.width - POPUP_WIDTH) / 2,
      );
      const top = Math.round(
        (window.screen.height - POPUP_HEIGHT) / 2,
      );

      const popup = window.open(
        authorizeUrl,
        'toolverse-auth',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes`,
      );

      if (!popup) {
        reject(
          new AuthError(
            'Failed to open login popup. Please allow popups for this site.',
          ),
        );
        return;
      }

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        clearInterval(pollTimer);
      };

      const onMessage = async (event: MessageEvent) => {
        // Only accept messages from our own origin
        if (event.origin !== window.location.origin) return;

        const data = event.data;
        if (data?.type !== 'toolverse-auth-callback') return;

        cleanup();
        popup.close();

        if (data.error) {
          reject(new AuthError(data.error));
          return;
        }

        try {
          const user = await this.handleCallback(data.code, data.state);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      };

      window.addEventListener('message', onMessage);

      // Poll to detect if the user closed the popup manually
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new AuthError('Login popup was closed before completing authentication.'));
        }
      }, 500);
    });
  }

  private async exchangeCodeForToken(code: string): Promise<AuthTokens> {
    const url = buildUrl(this.baseUrl, '/api/oauth/token');

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: this.apiKey,
          client_secret: this.apiKey,
          redirect_uri: `${window.location.origin}${CALLBACK_PATH}`,
          grant_type: 'authorization_code',
        }),
      });
    } catch (err) {
      throw new NetworkError(
        `Failed to exchange auth code: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (!response.ok) {
      const body = await response.text();
      throw new ApiError(
        `Token exchange failed: ${body}`,
        response.status,
      );
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
  }

  private async fetchUserInfo(accessToken: string): Promise<ToolverseUser> {
    const url = buildUrl(this.baseUrl, '/api/oauth/userinfo');

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      throw new NetworkError(
        `Failed to fetch user info: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch user info',
        response.status,
      );
    }

    return (await response.json()) as ToolverseUser;
  }

  private storeState(state: string): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(STATE_KEY, state);
      } catch {
        // Silently ignore
      }
    }
  }

  private retrieveState(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      try {
        return sessionStorage.getItem(STATE_KEY);
      } catch {
        return null;
      }
    }
    return null;
  }

  private clearState(): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(STATE_KEY);
      } catch {
        // Silently ignore
      }
    }
  }
}

/**
 * Helper that should run on the OAuth callback page (e.g. /toolverse-callback).
 * It extracts the code and state from the URL and posts them to the opener window.
 * If there is no opener (redirect mode), it returns the params so the app can
 * call `handleCallback()` directly.
 */
export function handleOAuthCallbackPage(): {
  code: string | null;
  state: string | null;
} | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (!code && !error) return null;

  // If opened as a popup, post message back to the opener
  if (window.opener) {
    window.opener.postMessage(
      {
        type: 'toolverse-auth-callback',
        code,
        state,
        error: error ?? undefined,
      },
      window.location.origin,
    );
    return null;
  }

  // Redirect mode — return params so the app can call handleCallback()
  return { code, state };
}
