import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
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

    // Fetch payments for tools owned by this creator
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        tool: { creatorId: userId },
      },
      orderBy: { createdAt: 'desc' },
    });

    const payouts = await prisma.payout.findMany({
      where: { creatorId: userId },
      orderBy: { requestedAt: 'desc' },
    });

    const lifetimeEarnings = payments.reduce((sum: number, p: { amount: unknown }) => sum + Number(p.amount), 0);
    const totalPayouts = payouts
      .filter((p: { status: string }) => p.status === 'COMPLETED')
      .reduce((sum: number, p: { amount: unknown }) => sum + Number(p.amount), 0);
    const pendingPayouts = payouts
      .filter((p: { status: string }) => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((sum: number, p: { amount: unknown }) => sum + Number(p.amount), 0);

    const tierShare = creatorProfile.tier === 'EARLY' ? 0.95
      : creatorProfile.tier === 'VERIFIED' ? 0.90
      : 0.85;

    const lifetimeCreatorShare = Math.floor(lifetimeEarnings * tierShare);
    const lifetimePlatformFee = lifetimeEarnings - lifetimeCreatorShare;
    const balance = lifetimeCreatorShare - totalPayouts - pendingPayouts;

    // Build monthly revenue breakdown (last 6 months)
    const months: Array<{
      month: string;
      grossRevenue: number;
      creatorShare: number;
      platformFee: number;
      refunds: number;
      netPayout: number;
      transactions: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthPayments = payments.filter(
        (p) => p.createdAt >= monthStart && p.createdAt < monthEnd,
      );

      const gross = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
      const share = Math.floor(gross * tierShare);
      const fee = gross - share;

      months.push({
        month: monthKey,
        grossRevenue: gross,
        creatorShare: share,
        platformFee: fee,
        refunds: 0,
        netPayout: share,
        transactions: monthPayments.length,
      });
    }

    const payoutHistory = payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      method: p.method,
      status: p.status,
      requestedAt: p.requestedAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
      reference: p.stripeTransferId ?? p.id,
    }));

    return NextResponse.json({
      wallet: {
        id: creatorProfile.userId,
        creatorId: userId,
        tier: creatorProfile.tier,
        balance: Math.max(0, balance),
        pendingPayout: pendingPayouts,
        lifetimeEarnings: lifetimeCreatorShare,
        lifetimePlatformFee,
        currency: 'JPY',
        payoutMethod: creatorProfile.stripeConnectId
          ? {
              type: 'stripe_connect' as const,
              details: `acct_****${creatorProfile.stripeConnectId.slice(-4)}`,
              isVerified: true,
              addedAt: creatorProfile.updatedAt.toISOString(),
            }
          : null,
        payoutHistory,
        monthlyRevenue: months,
      },
      months,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to fetch revenue data', { error: message });
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 },
    );
  }
}
