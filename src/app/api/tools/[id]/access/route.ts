import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

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
      select: { id: true, pricingType: true },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    // Free tools are always accessible
    if (tool.pricingType === 'free') {
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
