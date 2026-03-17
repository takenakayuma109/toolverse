import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, createPortalSession, stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

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

  let body: { priceId?: string; planId?: string; successUrl?: string; cancelUrl?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action } = body;
  const origin = request.nextUrl.origin;

  // Handle setup mode (card registration without subscription)
  if (action === 'setup') {
    try {
      // Find or create customer
      const existingCustomers = await stripe.customers.search({
        query: `metadata["userId"]:"${userId}"`,
        limit: 1,
      });

      let customerId: string;
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          metadata: { userId },
        });
        customerId = customer.id;
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'setup',
        customer: customerId,
        payment_method_types: ['card'],
        success_url: `${origin}${body.successUrl || '/billing?tab=payment&cardAdded=true'}`,
        cancel_url: `${origin}${body.cancelUrl || '/billing?tab=payment'}`,
        metadata: { userId },
      });

      return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Setup checkout session creation failed', { error: message });
      return NextResponse.json(
        { error: 'カード登録セッションの作成に失敗しました' },
        { status: 500 },
      );
    }
  }

  // Handle billing portal session
  if (action === 'portal') {
    const billingPlan = await prisma.userBillingPlan.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!billingPlan?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 },
      );
    }

    try {
      // Use userId as Stripe customer ID (set during checkout)
      const portalSession = await createPortalSession(
        userId,
        body.successUrl ?? `${request.nextUrl.origin}/billing`,
      );
      return NextResponse.json({ url: portalSession.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Portal session creation failed', { error: message });
      return NextResponse.json(
        { error: 'Failed to create portal session' },
        { status: 500 },
      );
    }
  }

  // Handle checkout session
  const { priceId, planId, successUrl, cancelUrl } = body;

  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
  }

  const resolvedSuccessUrl = successUrl
    ? `${origin}${successUrl}`
    : `${origin}/billing?success=true`;
  const resolvedCancelUrl = cancelUrl
    ? `${origin}${cancelUrl}`
    : `${origin}/billing`;

  try {
    const checkoutSession = await createCheckoutSession(
      userId,
      priceId,
      resolvedSuccessUrl,
      resolvedCancelUrl,
      planId ? { planId, priceId } : { priceId },
    );

    return NextResponse.json({
      id: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Checkout session creation failed', { error: message });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
