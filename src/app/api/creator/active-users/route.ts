import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-utils';
import {
  getCurrentMonthKey,
  getCreatorMAU,
  getCreatorMAULimit,
  getCreatorMAUByTool,
} from '@/core/active-users/activeUserService';

// ---------------------------------------------------------------------------
// GET /api/creator/active-users — Get MAU stats for the current creator
// ---------------------------------------------------------------------------

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

    const monthKey = getCurrentMonthKey();

    const [activeUsers, limit, byTool] = await Promise.all([
      getCreatorMAU(userId, monthKey),
      getCreatorMAULimit(userId),
      getCreatorMAUByTool(userId, monthKey),
    ]);

    // Resolve tool names
    const toolIds = byTool.map((t) => t.toolId);
    const tools =
      toolIds.length > 0
        ? await prisma.tool.findMany({
            where: { id: { in: toolIds } },
            select: { id: true, name: true },
          })
        : [];

    const toolNameMap = new Map(tools.map((t) => [t.id, t.name]));

    const percentUsed = limit !== null ? (activeUsers / limit) * 100 : 0;

    return NextResponse.json({
      monthKey,
      activeUsers,
      limit,
      limitReached: limit !== null && activeUsers >= limit,
      percentUsed: Math.round(percentUsed * 10) / 10,
      byTool: byTool.map((t) => ({
        toolId: t.toolId,
        toolName: toolNameMap.get(t.toolId) ?? 'Unknown',
        activeUsers: t.activeUsers,
      })),
    });
  });
}
