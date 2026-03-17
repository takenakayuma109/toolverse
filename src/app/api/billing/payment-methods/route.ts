import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { listPaymentMethods, stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';

/**
 * Find the Stripe customer ID for a user by searching customers with metadata.
 * Falls back to listing recent customers by email.
 */
async function findStripeCustomerId(userId: string, email?: string | null): Promise<string | null> {
  try {
    const existing = await stripe.customers.search({
      query: `metadata["userId"]:"${userId}"`,
      limit: 1,
    });
    if (existing.data.length > 0) {
      return existing.data[0].id;
    }
  } catch {
    // Search API may not be available — try by email
  }

  if (email) {
    try {
      const byEmail = await stripe.customers.list({ email, limit: 1 });
      if (byEmail.data.length > 0) {
        return byEmail.data[0].id;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }

  const userId = session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  try {
    const customerId = await findStripeCustomerId(userId, session.user?.email);
    if (!customerId) {
      return NextResponse.json({ methods: [] });
    }

    const stripePaymentMethods = await listPaymentMethods(customerId);

    const customer = await stripe.customers.retrieve(customerId).catch(() => null);
    const defaultPmId =
      customer && typeof customer !== 'string' && !customer.deleted
        ? (customer.invoice_settings?.default_payment_method as string | null)
        : null;

    const methods = stripePaymentMethods.map((pm) => ({
      id: pm.id,
      type: 'card' as const,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4 ?? '****',
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : null,
      isDefault: pm.id === defaultPmId,
      createdAt: new Date(pm.created * 1000).toISOString(),
    }));

    return NextResponse.json({ methods });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to fetch payment methods', { error: message });
    return NextResponse.json({ methods: [] });
  }
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }

  const userId = session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  let body: { paymentMethodId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { paymentMethodId } = body;
  if (!paymentMethodId) {
    return NextResponse.json(
      { error: 'paymentMethodId is required' },
      { status: 400 },
    );
  }

  try {
    // Find or create customer
    let customerId = await findStripeCustomerId(userId, session.user?.email);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user?.email ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const pm = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    const result = {
      id: pm.id,
      type: 'card' as const,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4 ?? '****',
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : null,
      isDefault: false,
      createdAt: new Date(pm.created * 1000).toISOString(),
    };

    return NextResponse.json({ paymentMethod: result }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to add payment method', { error: message });
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }

  if (!session.user?.id) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const paymentMethodId = searchParams.get('id');

  if (!paymentMethodId) {
    return NextResponse.json(
      { error: 'Payment method ID is required' },
      { status: 400 },
    );
  }

  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to remove payment method', { error: message });
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 },
    );
  }
}
