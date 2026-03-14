import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-utils';

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
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

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 },
      );
    }

    const tools = await prisma.tool.findMany({
      where: { creatorId: userId },
      include: {
        payments: { where: { status: 'COMPLETED' } },
        reviews: true,
        _count: { select: { installedBy: true } },
      },
    });

    const tierShare =
      creatorProfile.tier === 'EARLY'
        ? 0.95
        : creatorProfile.tier === 'VERIFIED'
          ? 0.9
          : 0.85;

    const toolRevenue = tools.map((tool) => {
      const totalRevenue = tool.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const creatorEarnings = Math.floor(totalRevenue * tierShare);
      const avgRating =
        tool.reviews.length > 0
          ? tool.reviews.reduce((sum, r) => sum + r.rating, 0) /
            tool.reviews.length
          : 0;

      return {
        toolId: tool.id,
        toolName: tool.name,
        toolSlug: tool.slug,
        category: tool.category,
        totalRevenue,
        creatorEarnings,
        platformFee: totalRevenue - creatorEarnings,
        transactionCount: tool.payments.length,
        userCount: tool._count.installedBy,
        avgRating,
        reviewCount: tool.reviews.length,
      };
    });

    return NextResponse.json({ toolRevenue });
  });
}
