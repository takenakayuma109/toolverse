import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { listPaymentMethods, stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';

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
    const stripePaymentMethods = await listPaymentMethods(userId);

    const customer = await stripe.customers.retrieve(userId).catch(() => null);
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
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 },
    );
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
    const pm = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: userId,
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

    return NextResponse.json(result, { status: 201 });
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
