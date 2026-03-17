import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { isCriticalEvent, logWebhookError } from '@/lib/webhook-errors';
import { logger } from '@/lib/logger';
import { isToolverseAttributed, extractAttribution } from '@/core/attribution/attributionEngine';
import { calculateRevenue, getRevenueShareRate } from '@/core/revenue/calculateRevenue';
import { addCredits } from '@/core/billing/creditService';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    logger.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Webhook signature verification failed', { error: message });
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.updated':
        await handleTransferPaid(event.data.object as Stripe.Transfer);
        break;

      default:
        // Acknowledge unhandled event types silently
        break;
    }
  } catch (err) {
    logWebhookError(event.type, event.id, err);

    // Critical events (checkout.session.completed, invoice.paid) return 500
    // so Stripe retries with exponential backoff. Non-critical events return
    // 200 to prevent retries — the error is logged for manual investigation.
    if (isCriticalEvent(event.type)) {
      return NextResponse.json(
        { error: `Webhook handler failed for ${event.type}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (!userId) {
    logger.error('checkout.session.completed: no userId found in session');
    return;
  }

  // Handle credit purchase (prepaid API credits)
  if (session.metadata?.type === 'credit_purchase') {
    const creditAmount = parseFloat(session.metadata.creditAmount ?? '0');
    if (creditAmount > 0) {
      await addCredits(userId, creditAmount, 'PURCHASE', 'Stripe credit purchase', {
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
      });
      logger.info('Credits added via Stripe purchase', { userId, creditAmount });
    }
    return; // credit purchases don't need further processing
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  // Record the payment (only if a toolId is present — one-time tool purchases)
  const toolId = session.metadata?.toolId;
  if (toolId) {
    await prisma.payment.create({
      data: {
        userId,
        toolId,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? session.id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? 'jpy',
        status: 'COMPLETED',
      },
    });
  }

  // Revenue attribution: if purchase came through Toolverse, calculate revenue share
  const metadata = (session.metadata ?? {}) as Record<string, string | undefined>;
  if (isToolverseAttributed(metadata)) {
    const attribution = extractAttribution(metadata);
    if (attribution.creatorId) {
      const creator = await prisma.creatorProfile.findUnique({
        where: { userId: attribution.creatorId },
      });
      if (creator) {
        const amount = session.amount_total ?? 0;
        const rate = getRevenueShareRate(creator.tier);
        const { platformFee, creatorRevenue } = calculateRevenue(amount, rate);
        logger.info('Toolverse revenue attributed', {
          toolId: attribution.toolId,
          creatorId: attribution.creatorId,
          amount,
          platformFee,
          creatorRevenue,
          tier: creator.tier,
        });
      }
    }
  }

  // Activate tool subscription if present
  if (subscriptionId && toolId) {
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionId },
      create: {
        userId,
        toolId,
        stripeSubscriptionId: subscriptionId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
      },
    });
  }

  // Activate billing plan subscription (pro/team upgrade)
  const planId = session.metadata?.planId;
  if (subscriptionId && planId) {
    // Find the BillingPlan record by planId name (e.g. 'pro', 'team')
    const billingPlan = await prisma.billingPlan.findFirst({
      where: {
        OR: [
          { id: planId },
          { name: { contains: planId, mode: 'insensitive' } },
        ],
      },
    });

    if (billingPlan) {
      await prisma.userBillingPlan.upsert({
        where: { userId_planId: { userId, planId: billingPlan.id } },
        create: {
          userId,
          planId: billingPlan.id,
          stripeSubscriptionId: subscriptionId,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          stripeSubscriptionId: subscriptionId,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      logger.info('Billing plan activated', { userId, planId: billingPlan.id, subscriptionId });
    } else {
      // BillingPlan record doesn't exist yet — create one on the fly
      const stripePriceId = session.metadata?.priceId?.trim();
      const newPlan = await prisma.billingPlan.create({
        data: {
          name: planId.charAt(0).toUpperCase() + planId.slice(1),
          price: planId === 'pro' ? 1980 : planId === 'team' ? 4980 : 0,
          currency: 'JPY',
          period: 'monthly',
          stripePriceId: stripePriceId ?? null,
          features: [],
        },
      });
      await prisma.userBillingPlan.create({
        data: {
          userId,
          planId: newPlan.id,
          stripeSubscriptionId: subscriptionId,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      logger.info('Billing plan created and activated', { userId, planId: newPlan.id, subscriptionId });
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subRef === 'string' ? subRef : subRef?.id ?? null;

  // Find the subscription in our DB to get the userId
  const subscription = subscriptionId
    ? await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      })
    : null;

  // Update subscription period
  if (subscriptionId) {
    await prisma.subscription
      .update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: new Date(invoice.period_start * 1000),
          currentPeriodEnd: new Date(invoice.period_end * 1000),
        },
      })
      .catch(() => {
        // Subscription may not exist yet in our DB
      });
  }

  // Record the payment if tool metadata is present
  const userId = subscription?.userId;
  const toolId = invoice.metadata?.toolId;
  if (userId && toolId) {
    await prisma.payment.create({
      data: {
        userId,
        toolId,
        stripePaymentIntentId: invoice.id,
        amount: invoice.amount_paid ?? 0,
        currency: invoice.currency ?? 'jpy',
        status: 'COMPLETED',
      },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subRef === 'string' ? subRef : subRef?.id ?? null;

  if (subscriptionId) {
    await prisma.subscription
      .update({
        where: { stripeSubscriptionId: subscriptionId },
        data: { status: 'PAST_DUE' },
      })
      .catch(() => {
        // Subscription may not exist yet in our DB
      });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' =
    subscription.status === 'active' || subscription.status === 'trialing'
      ? 'ACTIVE'
      : subscription.status === 'past_due'
        ? 'PAST_DUE'
        : 'CANCELLED';

  await prisma.subscription
    .update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status },
    })
    .catch(() => {
      // Subscription may not exist yet in our DB
    });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription
    .update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELLED',
      },
    })
    .catch(() => {
      // Subscription may not exist yet in our DB
    });
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  const payoutId = transfer.metadata?.payoutId;
  if (!payoutId) return;

  await prisma.payout
    .update({
      where: { id: payoutId },
      data: {
        status: 'PROCESSING',
        stripeTransferId: transfer.id,
      },
    })
    .catch(() => {
      // Payout record may not exist
    });
}

async function handleTransferPaid(transfer: Stripe.Transfer) {
  const payoutId = transfer.metadata?.payoutId;
  if (!payoutId) return;

  await prisma.payout
    .update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })
    .catch(() => {
      // Payout record may not exist
    });
}
