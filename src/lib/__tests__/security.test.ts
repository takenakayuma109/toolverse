import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeInput,
  isValidEmail,
  validatePassword,
  RateLimiter,
  isSessionValid,
  generateCSRFToken,
  SESSION_CONFIG,
} from '../security';

describe('sanitizeInput', () => {
  it('escapes HTML angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('escapes ampersands', () => {
    expect(sanitizeInput('foo & bar')).toBe('foo &amp; bar');
  });

  it('escapes double quotes', () => {
    expect(sanitizeInput('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });

  it('escapes forward slashes', () => {
    expect(sanitizeInput('a/b')).toBe('a&#x2F;b');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('leaves safe text unchanged', () => {
    expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
  });

  it('handles combined XSS patterns', () => {
    const input = '<img src="x" onerror="alert(\'xss\')">';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('"');
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co.jp')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@no-local.com')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
  });

  it('rejects emails exceeding 254 characters', () => {
    const longEmail = 'a'.repeat(246) + '@test.com';
    expect(longEmail.length).toBeGreaterThan(254);
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it('accepts emails at exactly 254 characters', () => {
    const local = 'a'.repeat(243);
    const email = `${local}@test.co.jp`;
    // This may or may not be exactly 254 chars; the key is it tests the boundary
    if (email.length <= 254) {
      expect(isValidEmail(email)).toBe(true);
    }
  });
});

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const result = validatePassword('MyP@ssw0rd!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = validatePassword('Ab1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('min_length');
  });

  it('rejects password longer than 128 chars', () => {
    const result = validatePassword('Ab1!' + 'x'.repeat(126));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('max_length');
  });

  it('requires uppercase letter', () => {
    const result = validatePassword('myp@ssw0rd!');
    expect(result.errors).toContain('uppercase');
  });

  it('requires lowercase letter', () => {
    const result = validatePassword('MYP@SSW0RD!');
    expect(result.errors).toContain('lowercase');
  });

  it('requires a number', () => {
    const result = validatePassword('MyP@ssword!');
    expect(result.errors).toContain('number');
  });

  it('requires a special character', () => {
    const result = validatePassword('MyPassw0rd');
    expect(result.errors).toContain('special');
  });

  it('reports multiple errors at once', () => {
    const result = validatePassword('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors).toContain('min_length');
    expect(result.errors).toContain('uppercase');
    expect(result.errors).toContain('number');
    expect(result.errors).toContain('special');
  });
});

describe('RateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = new RateLimiter(3, 60000);
    expect(limiter.check('user1').allowed).toBe(true);
    expect(limiter.check('user1').allowed).toBe(true);
    expect(limiter.check('user1').allowed).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const limiter = new RateLimiter(2, 60000);
    limiter.check('user1');
    limiter.check('user1');
    const result = limiter.check('user1');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks different keys independently', () => {
    const limiter = new RateLimiter(1, 60000);
    limiter.check('user1');
    expect(limiter.check('user1').allowed).toBe(false);
    expect(limiter.check('user2').allowed).toBe(true);
  });

  it('resets a key', () => {
    const limiter = new RateLimiter(1, 60000);
    limiter.check('user1');
    expect(limiter.check('user1').allowed).toBe(false);
    limiter.reset('user1');
    expect(limiter.check('user1').allowed).toBe(true);
  });

  it('allows requests after window expires', () => {
    const limiter = new RateLimiter(1, 100);
    limiter.check('user1');
    expect(limiter.check('user1').allowed).toBe(false);

    // Simulate time passing by manipulating Date.now
    const originalNow = Date.now;
    vi.spyOn(Date, 'now').mockReturnValue(originalNow() + 200);

    expect(limiter.check('user1').allowed).toBe(true);

    vi.restoreAllMocks();
  });

  it('uses default config (5 attempts, 60s window)', () => {
    const limiter = new RateLimiter();
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('key').allowed).toBe(true);
    }
    expect(limiter.check('key').allowed).toBe(false);
  });
});

describe('isSessionValid', () => {
  it('returns true for recent timestamp', () => {
    expect(isSessionValid(Date.now())).toBe(true);
  });

  it('returns true for timestamp within maxAge', () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    expect(isSessionValid(oneHourAgo)).toBe(true);
  });

  it('returns false for expired timestamp', () => {
    const expired = Date.now() - SESSION_CONFIG.maxAge - 1000;
    expect(isSessionValid(expired)).toBe(false);
  });
});

describe('generateCSRFToken', () => {
  it('returns a 64-character hex string', () => {
    const token = generateCSRFToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates unique tokens', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });
});
