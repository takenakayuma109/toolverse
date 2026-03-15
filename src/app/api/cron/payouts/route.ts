import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createTransfer } from '@/lib/stripe';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// GET /api/cron/payouts — Process monthly creator payouts
// Scheduled: 1st of every month at midnight UTC via Vercel cron
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all pending payouts
    const pendingPayouts = await prisma.payout.findMany({
      where: { status: 'PENDING' },
      include: {
        creator: {
          select: {
            userId: true,
            displayName: true,
            stripeConnectId: true,
          },
        },
      },
    });

    logger.info('Payout job started', { pendingCount: pendingPayouts.length });

    const results = await Promise.allSettled(
      pendingPayouts.map(async (payout) => {
        if (!payout.creator.stripeConnectId) {
          logger.warn('Payout skipped: no Stripe Connect account', {
            payoutId: payout.id,
            creatorId: payout.creatorId,
          });
          return { payoutId: payout.id, status: 'skipped', reason: 'no_connect_account' };
        }

        // Mark as processing
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: 'PROCESSING' },
        });

        try {
          const transfer = await createTransfer(
            Math.round(Number(payout.amount) * 100), // Convert to cents
            payout.currency.toLowerCase(),
            payout.creator.stripeConnectId,
            `Toolverse payout for ${payout.creator.displayName}`,
          );

          // Mark as completed
          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              status: 'COMPLETED',
              stripeTransferId: transfer.id,
              completedAt: new Date(),
            },
          });

          logger.info('Payout completed', {
            payoutId: payout.id,
            transferId: transfer.id,
            amount: Number(payout.amount),
            currency: payout.currency,
          });

          return { payoutId: payout.id, status: 'completed', transferId: transfer.id };
        } catch (error) {
          // Mark as failed
          await prisma.payout.update({
            where: { id: payout.id },
            data: { status: 'FAILED' },
          });

          logger.error('Payout failed', {
            payoutId: payout.id,
            error: error instanceof Error ? error.message : String(error),
          });

          return {
            payoutId: payout.id,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    const summary = {
      total: pendingPayouts.length,
      completed: results.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 'completed',
      ).length,
      failed: results.filter(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed'),
      ).length,
      skipped: results.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 'skipped',
      ).length,
    };

    logger.info('Payout job completed', summary);

    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    logger.error('Payout cron failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Payout processing failed' },
      { status: 500 },
    );
  }
}
