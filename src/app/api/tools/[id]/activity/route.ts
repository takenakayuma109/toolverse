import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';
import {
  checkMAUCapacity,
  recordActiveUser,
} from '@/core/active-users/activeUserService';

type Params = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// POST /api/tools/[id]/activity — Record an active user event for a tool
// ---------------------------------------------------------------------------

export async function POST(_request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = session.user?.id;

    if (!userId) {
      return errorResponse('User ID not found', 401);
    }

    const { id: toolId } = await params;

    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true, creatorId: true },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    // Check MAU capacity for this creator
    const capacity = await checkMAUCapacity(tool.creatorId, userId, toolId);

    if (!capacity.allowed) {
      return NextResponse.json(
        {
          error: 'Creator has reached the monthly active user limit',
          code: 'MAU_LIMIT_EXCEEDED',
          currentCount: capacity.currentCount,
          limit: capacity.limit,
        },
        { status: 403 },
      );
    }

    // Record the active user event
    await recordActiveUser(userId, toolId, tool.creatorId);

    return NextResponse.json({
      recorded: true,
      currentCount: capacity.currentCount,
      limit: capacity.limit,
    });
  });
}
