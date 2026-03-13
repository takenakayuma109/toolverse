import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { reviewCreateSchema, parseOrError, paginationOffset } from '@/lib/validations';
import { errorResponse, withErrorHandler, paginatedResponse } from '@/lib/api-utils';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

// ---------------------------------------------------------------------------
// GET /api/tools/[id]/reviews — List reviews for a tool (public, paginated)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const { id: toolId } = await params;

    // Verify the tool exists
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const [query, qErr] = parseOrError(reviewQuerySchema, {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (qErr) {
      return errorResponse(qErr.error, 400, qErr.details);
    }

    const { offset, limit, page } = paginationOffset(query.page, query.limit);

    const where = { toolId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(reviews, total, page, limit));
  });
}

// ---------------------------------------------------------------------------
// POST /api/tools/[id]/reviews — Create a review (auth required, one per user)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id: toolId } = await params;

    // Verify the tool exists
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(reviewCreateSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    // One review per user per tool
    const existing = await prisma.review.findFirst({
      where: { toolId, userId },
    });
    if (existing) {
      return errorResponse('You have already reviewed this tool', 409);
    }

    const review = await prisma.review.create({
      data: {
        toolId,
        userId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update tool aggregate rating
    const aggregation = await prisma.review.aggregate({
      where: { toolId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.tool.update({
      where: { id: toolId },
      data: {
        rating: aggregation._avg.rating ?? 0,
        reviewCount: aggregation._count.rating,
      },
    });

    return NextResponse.json(review, { status: 201 });
  });
}
