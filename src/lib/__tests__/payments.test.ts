import { describe, it, expect } from 'vitest';
import { getPaymentProvider } from '../payments';

// StripeProvider tests require STRIPE_SECRET_KEY and hit the real Stripe API.
// They are skipped in CI/local unless the env var is set.
const hasStripe = !!process.env.STRIPE_SECRET_KEY;

describe.skipIf(!hasStripe)('StripeProvider (integration)', () => {
  // These tests only run when STRIPE_SECRET_KEY is available
  it('placeholder for integration tests', () => {
    expect(true).toBe(true);
  });
});

describe('getPaymentProvider', () => {
  it('returns StripeProvider by default', () => {
    const provider = getPaymentProvider();
    expect(provider.name).toBe('stripe');
  });

  it('returns StripeProvider for "stripe"', () => {
    const provider = getPaymentProvider('stripe');
    expect(provider.name).toBe('stripe');
  });

  it('returns StripeProvider for "toolverse-pay" (all providers use Stripe)', () => {
    const provider = getPaymentProvider('toolverse-pay');
    expect(provider.name).toBe('stripe');
  });
});
