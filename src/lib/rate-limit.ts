import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Upstash Redis-backed rate limiters
//
// Uses sliding window algorithm for smooth rate limiting across distributed
// instances. Falls back to an in-memory sliding window counter when Redis is
// unavailable, so requests are never left unprotected.
// ---------------------------------------------------------------------------

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    logger.warn(
      '[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. ' +
        'Using in-memory rate limiting fallback.'
    );
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedis();

/** General API rate limiter: 100 requests per 60-second sliding window. */
export const apiRateLimiter: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      prefix: 'rl:api',
      analytics: true,
    })
  : null;

/** Auth endpoint rate limiter: 10 requests per 60-second sliding window. */
export const authRateLimiter: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'rl:auth',
      analytics: true,
    })
  : null;

// ---------------------------------------------------------------------------
// In-memory sliding window fallback
//
// Used when Redis is not configured or becomes unreachable. Tracks request
// timestamps per identifier in a Map and enforces the same rate limits.
// ---------------------------------------------------------------------------

interface SlidingWindowEntry {
  timestamps: number[];
}

const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 60_000;

const inMemoryStore = new Map<string, SlidingWindowEntry>();

/** Periodically purge stale entries to prevent memory leaks. */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  inMemoryStore.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) {
      inMemoryStore.delete(key);
    }
  });
}, CLEANUP_INTERVAL_MS);

// Allow the Node.js process to exit without waiting for the cleanup timer.
if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
  cleanupInterval.unref();
}

function checkInMemory(identifier: string, limit: number): RateLimitResult {
  const now = Date.now();
  const key = `${limit}:${identifier}`;

  let entry = inMemoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    inMemoryStore.set(key, entry);
  }

  // Slide the window – discard timestamps older than WINDOW_MS
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + WINDOW_MS - now;
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

// ---------------------------------------------------------------------------
// Helper used by the middleware
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check rate limit for a given identifier and endpoint type.
 * Falls back to an in-memory sliding window counter when Redis is
 * unavailable, ensuring requests are never left unprotected.
 */
export async function checkRateLimit(
  identifier: string,
  isAuth: boolean
): Promise<RateLimitResult> {
  const limiter = isAuth ? authRateLimiter : apiRateLimiter;
  const limit = isAuth ? 10 : 100;

  if (!limiter) {
    // Redis not configured – use in-memory fallback
    return checkInMemory(identifier, limit);
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      retryAfterMs: result.success ? 0 : result.reset - Date.now(),
    };
  } catch (error) {
    // Redis unreachable – fall back to in-memory rate limiting
    logger.warn('[rate-limit] Redis unavailable, falling back to in-memory rate limiting', {
      error: error instanceof Error ? error.message : String(error),
    });
    return checkInMemory(identifier, limit);
  }
}
