import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { adminToolStatusSchema, parseOrError, paginationOffset } from '@/lib/validations';
import { errorResponse, withErrorHandler, paginatedResponse } from '@/lib/api-utils';
import { z } from 'zod';

const adminToolQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ---------------------------------------------------------------------------
// GET /api/admin/tools — List all tools regardless of status (admin only)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const [query, qErr] = parseOrError(adminToolQuerySchema, {
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (qErr) {
      return errorResponse(qErr.error, 400, qErr.details);
    }

    const { offset, limit, page } = paginationOffset(query.page, query.limit);

    const where: Record<string, unknown> = {};
    if (query.status) {
      where.status = query.status;
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
// PUT /api/admin/tools — Update tool status (approve/reject/suspend) (admin only)
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const body = await request.json();
    const [data, validationError] = parseOrError(adminToolStatusSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    const tool = await prisma.tool.findUnique({ where: { id: data.toolId } });
    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    const updated = await prisma.tool.update({
      where: { id: data.toolId },
      data: {
        status: data.status as 'PUBLISHED' | 'REJECTED' | 'DRAFT',
      },
    });

    return NextResponse.json(updated);
  });
}
