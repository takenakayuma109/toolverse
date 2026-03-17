import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';

export async function POST() {
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
    // Find or create a Stripe customer for this user
    let customerId: string;

    try {
      const existing = await stripe.customers.search({
        query: `metadata["userId"]:"${userId}"`,
        limit: 1,
      });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: session.user?.email ?? undefined,
          metadata: { userId },
        });
        customerId = customer.id;
      }
    } catch {
      // Search might fail — create a new customer
      const customer = await stripe.customers.create({
        email: session.user?.email ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: { userId },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('SetupIntent creation failed', { error: message });
    return NextResponse.json(
      { error: `セットアップの作成に失敗しました: ${message}` },
      { status: 500 },
    );
  }
}
