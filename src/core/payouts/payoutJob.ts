import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getRevenueShareRate } from '@/core/revenue/calculateRevenue';

/**
 * Monthly payout aggregation job.
 * Aggregates completed payments for a given period,
 * calculates creator shares based on tier, and creates payout records.
 */
export async function runPayoutJob(periodStart: Date, periodEnd: Date) {
  const creators = await prisma.creatorProfile.findMany({
    include: {
      tools: {
        include: {
          payments: {
            where: {
              status: 'COMPLETED',
              createdAt: {
                gte: periodStart,
                lte: periodEnd,
              },
            },
          },
        },
      },
    },
  });

  const payouts = [];

  for (const creator of creators) {
    const totalPayments = creator.tools.reduce(
      (sum, tool) =>
        sum + tool.payments.reduce((s, p) => s + Number(p.amount), 0),
      0,
    );

    if (totalPayments === 0) continue;

    const rate = getRevenueShareRate(creator.tier);
    const creatorShare = Math.floor(totalPayments * (1 - rate));

    if (creatorShare <= 0) continue;

    const payout = await prisma.payout.create({
      data: {
        creatorId: creator.userId,
        amount: creatorShare,
        currency: 'JPY',
        method: creator.stripeConnectId ? 'stripe_connect' : 'bank_transfer',
        status: 'PENDING',
      },
    });

    payouts.push(payout);
  }

  logger.info('Payout job completed', {
    period: { start: periodStart, end: periodEnd },
    totalPayouts: payouts.length,
  });

  return payouts;
}
