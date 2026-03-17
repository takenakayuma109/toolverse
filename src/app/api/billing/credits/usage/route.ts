import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * GET /api/billing/credits/usage
 * Get the current user's API usage history with pagination.
 */
export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.apiUsageRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.apiUsageRecord.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    data: records.map((r) => ({
      id: r.id,
      provider: r.provider,
      model: r.model,
      toolId: r.toolId,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      rawCost: Number(r.rawCost),
      markupRate: Number(r.markupRate),
      totalCost: Number(r.markedUpCost),
      durationMs: r.durationMs,
      createdAt: r.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
