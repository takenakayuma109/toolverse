import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { withErrorHandler } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/admin/stats — Aggregate dashboard stats
// ---------------------------------------------------------------------------

export async function GET() {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalTools, pendingReviews, revenueMTD] =
      await Promise.all([
        prisma.user.count(),
        prisma.tool.count(),
        prisma.tool.count({ where: { status: 'IN_REVIEW' } }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfMonth },
          },
        }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalTools,
      pendingReviews,
      revenueMTD: Number(revenueMTD._sum.amount ?? 0),
    });
  });
}
