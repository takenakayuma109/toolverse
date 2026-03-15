import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { parseOrError, paginationOffset } from '@/lib/validations';
import { errorResponse, withErrorHandler, paginatedResponse } from '@/lib/api-utils';
import { z } from 'zod';

const moderationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const moderationActionSchema = z.object({
  toolId: z.string().min(1, 'Tool ID is required'),
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// GET /api/admin/moderation — List tools pending review
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const [query, qErr] = parseOrError(moderationQuerySchema, {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (qErr) {
      return errorResponse(qErr.error, 400, qErr.details);
    }

    const { offset, limit, page } = paginationOffset(query.page, query.limit);

    const where = { status: 'IN_REVIEW' as const };

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: offset,
        take: limit,
        include: {
          creator: { select: { userId: true, displayName: true } },
        },
      }),
      prisma.tool.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(tools, total, page, limit));
  });
}

// ---------------------------------------------------------------------------
// POST /api/admin/moderation — Approve or reject a tool
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const body = await request.json();
    const [data, validationError] = parseOrError(moderationActionSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    const tool = await prisma.tool.findUnique({ where: { id: data.toolId } });
    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    if (tool.status !== 'IN_REVIEW') {
      return errorResponse(
        `Tool is not pending review (current status: ${tool.status})`,
        400
      );
    }

    const newStatus = data.action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED';

    const updated = await prisma.tool.update({
      where: { id: data.toolId },
      data: { status: newStatus },
      include: {
        creator: { select: { userId: true, displayName: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      moderationAction: data.action,
      moderationReason: data.reason ?? null,
    });
  });
}
