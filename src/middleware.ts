import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// Nonce generation
// ---------------------------------------------------------------------------

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function isAuthEndpoint(pathname: string): boolean {
  return pathname.startsWith('/api/auth');
}

// ---------------------------------------------------------------------------
// CORS origin validation
// ---------------------------------------------------------------------------

function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) =>
    o.trim()
  );

  // In development, allow any origin
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // In production, require an explicit allow-list
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return false;
  }

  return allowedOrigins.includes(origin);
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = isApiRoute(pathname);

  // ----- Skip middleware for NextAuth routes (they handle their own redirects) -----
  if (isAuthEndpoint(pathname)) {
    return NextResponse.next();
  }

  // ----- Rate limiting for API routes -----
  if (isApi) {
    const ip = getClientIP(request);
    const isAuth = isAuthEndpoint(pathname);
    const rateLimitKey = `${ip}:${isAuth ? 'auth' : 'api'}`;

    const { allowed, limit, remaining, retryAfterMs } = await checkRateLimit(
      rateLimitKey,
      isAuth
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(retryAfterMs / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // For API routes, build response with CORS + rate limit + security headers
    const response = NextResponse.next();

    // Rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());

    // CORS headers for API routes
    const origin = request.headers.get('origin') ?? '';

    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production' && !origin) {
      // In dev, allow requests with no Origin header (e.g. curl / Postman)
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    // In production with a disallowed or missing origin, no
    // Access-Control-Allow-Origin header is set – the browser will
    // block the cross-origin response.

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  // ----- Non-API routes: security headers + CSP -----
  const nonce = generateNonce();
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Pass the nonce to server components / layout via a request header
  response.headers.set('x-nonce', nonce);

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // In development, Turbopack/Next.js requires 'unsafe-eval' for HMR and
  // fast-refresh. In production we rely solely on nonce-based script loading.
  const scriptSrc =
    process.env.NODE_ENV === 'development'
      ? `'self' 'unsafe-eval' 'nonce-${nonce}' https://www.googletagmanager.com`
      : `'self' 'nonce-${nonce}' https://www.googletagmanager.com`;

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://*.vercel.app https://*.vercel-scripts.com https://www.google-analytics.com https://www.googletagmanager.com https://accounts.google.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://github.com https://appleid.apple.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)'],
};
