import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';
import {
  checkMAUCapacity,
  recordActiveUser,
} from '@/core/active-users/activeUserService';

type Params = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/tools/[id]/access?userId=xxx — Check if a user has access to a tool
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const { id: toolId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return errorResponse('userId query parameter is required', 400);
    }

    // Check if the tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true, pricingType: true, creatorId: true },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    // --- MAU limit check ---
    const capacity = await checkMAUCapacity(tool.creatorId, userId, toolId);
    if (!capacity.allowed) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'mau_limit_exceeded',
        currentCount: capacity.currentCount,
        limit: capacity.limit,
      });
    }

    // Free tools are always accessible
    if (tool.pricingType === 'free') {
      // Record the active user
      await recordActiveUser(userId, toolId, tool.creatorId);
      return NextResponse.json({ hasAccess: true });
    }

    // Check for a completed one-time payment
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        toolId,
        status: 'COMPLETED',
      },
      select: { id: true },
    });

    if (payment) {
      await recordActiveUser(userId, toolId, tool.creatorId);
      return NextResponse.json({ hasAccess: true });
    }

    // Check for an active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        toolId,
        status: 'ACTIVE',
      },
      select: {
        status: true,
        currentPeriodEnd: true,
      },
    });

    if (subscription) {
      await recordActiveUser(userId, toolId, tool.creatorId);
      return NextResponse.json({
        hasAccess: true,
        subscription: {
          status: subscription.status,
          expiresAt: subscription.currentPeriodEnd.toISOString(),
        },
      });
    }

    return NextResponse.json({ hasAccess: false });
  });
}
