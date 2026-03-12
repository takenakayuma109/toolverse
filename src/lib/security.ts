export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('min_length');
  if (password.length > 128) errors.push('max_length');
  if (!/[A-Z]/.test(password)) errors.push('uppercase');
  if (!/[a-z]/.test(password)) errors.push('lowercase');
  if (!/[0-9]/.test(password)) errors.push('number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('special');
  return { valid: errors.length === 0, errors };
}

export class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(private maxAttempts: number = 5, private windowMs: number = 60000) {}

  check(key: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || now > entry.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (entry.count >= this.maxAttempts) {
      return { allowed: false, retryAfterMs: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, retryAfterMs: 0 };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
  }
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export const SESSION_CONFIG = {
  tokenKey: 'toolverse-session-token',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  renewThreshold: 24 * 60 * 60 * 1000,
};

export function isSessionValid(timestamp: number): boolean {
  return Date.now() - timestamp < SESSION_CONFIG.maxAge;
}

export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export const secureStorage = {
  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      const data = JSON.stringify({ value, timestamp: Date.now() });
      localStorage.setItem(key, data);
    } catch { /* quota exceeded */ }
  },

  get<T>(key: string, maxAge?: number): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { value, timestamp } = JSON.parse(raw);
      if (maxAge && Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      return value as T;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};
