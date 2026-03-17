import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
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
    // Check database for active billing plan
    const userPlan = await prisma.userBillingPlan.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (userPlan) {
      return NextResponse.json({
        planId: userPlan.plan.name.toLowerCase(),
        planName: userPlan.plan.name,
        status: userPlan.status,
        stripeSubscriptionId: userPlan.stripeSubscriptionId,
        currentPeriodEnd: userPlan.currentPeriodEnd.toISOString(),
      });
    }

    // Fallback: check Stripe directly for active subscriptions
    try {
      const customers = await stripe.customers.search({
        query: `metadata["userId"]:"${userId}"`,
        limit: 1,
      });

      if (customers.data.length > 0) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          const priceId = sub.items.data[0]?.price?.id;
          const metadata = sub.metadata;

          // Determine plan from metadata or price
          let planId = metadata?.planId || 'pro';

          return NextResponse.json({
            planId,
            planName: planId.charAt(0).toUpperCase() + planId.slice(1),
            status: 'ACTIVE',
            stripeSubscriptionId: sub.id,
            currentPeriodEnd: new Date(sub.billing_cycle_anchor * 1000).toISOString(),
            source: 'stripe',
          });
        }
      }
    } catch {
      // Stripe search may fail — return free plan
    }

    // No active plan found — user is on free
    return NextResponse.json({
      planId: 'free',
      planName: 'Free',
      status: 'ACTIVE',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to fetch current plan', { error: message });
    return NextResponse.json({
      planId: 'free',
      planName: 'Free',
      status: 'ACTIVE',
    });
  }
}
