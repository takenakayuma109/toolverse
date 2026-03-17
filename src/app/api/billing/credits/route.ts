import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getBalance } from '@/core/billing/creditService';
import { stripe } from '@/lib/stripe';
import { parseOrError } from '@/lib/validations';
import { creditPurchaseSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * GET /api/billing/credits
 * Get the current user's credit balance.
 */
export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }
  const userId = (session.user as { id: string }).id;

  const balance = await getBalance(userId);

  return NextResponse.json({ balance, currency: 'USD' });
}

/**
 * POST /api/billing/credits
 * Purchase credits via Stripe Checkout (payment mode).
 */
export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }
  const userId = (session.user as { id: string }).id;
  const userEmail = (session.user as { email: string }).email;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const [data, validationError] = parseOrError(creditPurchaseSchema, body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const { amount } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    // Create a Stripe Checkout session in payment mode for credit purchase
    // Amount is in USD — convert to cents for Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Toolverse API Credits — $${amount.toFixed(2)}`,
              description: 'Prepaid credits for LLM API usage on Toolverse',
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'credit_purchase',
        userId,
        creditAmount: String(amount),
      },
      client_reference_id: userId,
      success_url: `${baseUrl}/billing?credits=success`,
      cancel_url: `${baseUrl}/billing?credits=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    logger.error('Credit purchase checkout failed', { userId, error: message });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
