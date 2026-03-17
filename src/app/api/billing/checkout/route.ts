import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession, stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Find or create a Stripe customer for a given user.
 */
async function findOrCreateCustomer(userId: string, email?: string | null): Promise<string> {
  // 1. Check if we already have a Stripe customer for this user in our DB
  try {
    const billingPlan = await prisma.userBillingPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (billingPlan?.stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(billingPlan.stripeSubscriptionId);
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      if (customerId) return customerId;
    }
  } catch {
    // DB may not have billing plan yet — continue to search/create
  }

  // 2. Search Stripe for existing customer by metadata
  try {
    const existing = await stripe.customers.search({
      query: `metadata["userId"]:"${userId}"`,
      limit: 1,
    });
    if (existing.data.length > 0) {
      return existing.data[0].id;
    }
  } catch {
    // Search might fail on new Stripe accounts — continue to create
  }

  // 3. Create a new customer
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });
  return customer.id;
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

  let body: { priceId?: string; planId?: string; successUrl?: string; cancelUrl?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action } = body;
  const origin = request.nextUrl.origin;
  const userEmail = session.user?.email;

  // Handle setup mode (card registration without subscription)
  if (action === 'setup') {
    try {
      const customerId = await findOrCreateCustomer(userId, userEmail);

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
        { error: `カード登録セッションの作成に失敗しました: ${message}` },
        { status: 500 },
      );
    }
  }

  // Handle billing portal session
  if (action === 'portal') {
    try {
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

      const sub = await stripe.subscriptions.retrieve(billingPlan.stripeSubscriptionId);
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const portalSession = await createPortalSession(
        customerId,
        body.successUrl ?? `${origin}/billing`,
      );
      return NextResponse.json({ url: portalSession.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Portal session creation failed', { error: message });
      return NextResponse.json(
        { error: `Failed to create portal session: ${message}` },
        { status: 500 },
      );
    }
  }

  // Handle checkout session (subscription)
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
    const customerId = await findOrCreateCustomer(userId, userEmail);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      client_reference_id: userId,
      metadata: { userId, ...(planId ? { planId, priceId } : { priceId }) },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      id: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Checkout session creation failed', { error: message, priceId, userId });
    return NextResponse.json(
      { error: `チェックアウトの作成に失敗しました: ${message}` },
      { status: 500 },
    );
  }
}
