import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { createTransfer } from '@/lib/stripe';
import { logger } from '@/lib/logger';

const MIN_PAYOUT_AMOUNT = 10000; // ¥10,000 minimum

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }

  const userId = session.user?.id;
  const userRole = (session.user as { role?: string })?.role;

  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Creator or admin role required' },
      { status: 403 },
    );
  }

  let body: { amount?: number; method?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { amount, method } = body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'A positive amount is required' },
      { status: 400 },
    );
  }

  if (amount < MIN_PAYOUT_AMOUNT) {
    return NextResponse.json(
      { error: `Minimum payout amount is ${MIN_PAYOUT_AMOUNT} JPY` },
      { status: 400 },
    );
  }

  const validMethods = ['stripe_connect', 'bank_transfer', 'paypal'] as const;
  const payoutMethod = method && validMethods.includes(method as typeof validMethods[number])
    ? (method as typeof validMethods[number])
    : 'stripe_connect';

  try {
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 },
      );
    }

    // Payments for tools owned by this creator
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        tool: { creatorId: userId },
      },
    });

    const payouts = await prisma.payout.findMany({
      where: {
        creatorId: userId,
        status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] },
      },
    });

    const tierShare = creatorProfile.tier === 'EARLY' ? 0.95
      : creatorProfile.tier === 'VERIFIED' ? 0.90
      : 0.85;

    const lifetimeEarnings = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const lifetimeCreatorShare = Math.floor(lifetimeEarnings * tierShare);
    const totalPayoutsProcessed = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const availableBalance = lifetimeCreatorShare - totalPayoutsProcessed;

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          available: availableBalance,
          requested: amount,
        },
        { status: 400 },
      );
    }

    const payout = await prisma.payout.create({
      data: {
        creatorId: userId,
        amount,
        currency: 'JPY',
        method: payoutMethod,
        status: 'PENDING',
      },
    });

    // If using Stripe Connect, initiate the transfer
    if (payoutMethod === 'stripe_connect' && creatorProfile.stripeConnectId) {
      try {
        const transfer = await createTransfer(
          amount,
          'JPY',
          creatorProfile.stripeConnectId,
          `Toolverse creator payout: ${payout.id}`,
        );

        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            stripeTransferId: transfer.id,
            status: 'PROCESSING',
          },
        });

        return NextResponse.json({
          payout: {
            id: payout.id,
            amount,
            currency: 'JPY',
            method: payoutMethod,
            status: 'PROCESSING',
            requestedAt: payout.requestedAt.toISOString(),
            stripeTransferId: transfer.id,
          },
        });
      } catch (err) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: 'FAILED' },
        });

        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.error('Stripe transfer failed', { error: message });
        return NextResponse.json(
          { error: 'Stripe transfer failed. Payout has been cancelled.' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      payout: {
        id: payout.id,
        amount,
        currency: 'JPY',
        method: payoutMethod,
        status: 'PENDING',
        requestedAt: payout.requestedAt.toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Payout request failed', { error: message });
    return NextResponse.json(
      { error: 'Failed to process payout request' },
      { status: 500 },
    );
  }
}
