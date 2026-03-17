import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const checks: Record<string, unknown> = {
    keyExists: !!key,
    keyPrefix: key ? key.substring(0, 12) + '...' : 'NOT SET',
    keyLength: key?.length ?? 0,
    hasWhitespace: key ? key !== key.trim() : false,
    hasNewline: key ? /[\r\n]/.test(key) : false,
    nodeVersion: process.version,
    platform: process.platform,
  };

  // Try a direct fetch to Stripe API (bypass SDK)
  if (key) {
    try {
      const res = await fetch('https://api.stripe.com/v1/prices?limit=1', {
        headers: {
          'Authorization': `Bearer ${key.trim()}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = await res.json();
      checks.directFetchStatus = res.status;
      checks.directFetchOk = res.ok;
      if (res.ok && data.data?.[0]) {
        checks.firstPriceId = data.data[0].id;
      } else {
        checks.directFetchError = data.error?.message ?? 'Unknown';
      }
    } catch (err) {
      checks.directFetchError = err instanceof Error ? err.message : 'Fetch failed';
    }
  }

  // Try Stripe SDK
  if (key) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(key.trim(), {
        apiVersion: '2026-02-25.clover' as never,
        maxNetworkRetries: 1,
        timeout: 10000,
      });
      const prices = await stripe.prices.list({ limit: 1 });
      checks.sdkStatus = 'OK';
      checks.sdkFirstPrice = prices.data[0]?.id ?? 'none';
    } catch (err) {
      checks.sdkError = err instanceof Error ? err.message : 'SDK failed';
    }
  }

  return NextResponse.json(checks);
}
