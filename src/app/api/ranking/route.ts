import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateRankingScore } from '@/core/ranking/rankingEngine';
import { withErrorHandler } from '@/lib/api-utils';

export async function GET() {
  return withErrorHandler(async () => {
    const tools = await prisma.tool.findMany({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      include: {
        creator: true,
        reviews: true,
      },
    });

    const rankings = tools.map((tool) => {
      const avgRating =
        tool.reviews.length > 0
          ? tool.reviews.reduce((sum, r) => sum + r.rating, 0) /
            tool.reviews.length
          : 0;

      const score = calculateRankingScore({
        usage: Math.min(tool.userCount / 1000, 1),
        retention: 0,
        rating: avgRating / 5,
        reviews: Math.min(tool.reviews.length / 100, 1),
        updates: 0,
      });

      return {
        toolId: tool.id,
        toolName: tool.name,
        toolSlug: tool.slug,
        icon: tool.icon,
        category: tool.category,
        rankingScore: score,
        avgRating,
        reviewCount: tool.reviews.length,
        userCount: tool.userCount,
        creatorName: tool.creator.displayName,
      };
    });

    rankings.sort((a, b) => b.rankingScore - a.rankingScore);

    return NextResponse.json(rankings);
  });
}
