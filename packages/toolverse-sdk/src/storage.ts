import type { AuthTokens, ToolverseUser } from './types';

const KEY_PREFIX = 'toolverse_';
const TOKENS_KEY = `${KEY_PREFIX}tokens`;
const USER_KEY = `${KEY_PREFIX}user`;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked — silently ignore
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently ignore
  }
}

export class TokenStorage {
  setTokens(tokens: AuthTokens): void {
    setItem(TOKENS_KEY, JSON.stringify(tokens));
  }

  getTokens(): AuthTokens | null {
    const raw = getItem(TOKENS_KEY);
    if (!raw) return null;

    try {
      const tokens: AuthTokens = JSON.parse(raw);

      // Check expiry — treat as expired if within 30 seconds of expiry
      if (tokens.expiresAt <= Date.now() + 30_000) {
        this.clearTokens();
        return null;
      }

      return tokens;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  clearTokens(): void {
    removeItem(TOKENS_KEY);
  }

  setUser(user: ToolverseUser): void {
    setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): ToolverseUser | null {
    const raw = getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as ToolverseUser;
    } catch {
      this.clearUser();
      return null;
    }
  }

  clearUser(): void {
    removeItem(USER_KEY);
  }

  clearAll(): void {
    this.clearTokens();
    this.clearUser();
  }
}
