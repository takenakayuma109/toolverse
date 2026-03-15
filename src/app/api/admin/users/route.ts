import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { parseOrError, paginationOffset } from '@/lib/validations';
import { errorResponse, withErrorHandler, paginatedResponse } from '@/lib/api-utils';
import { z } from 'zod';

const adminUserQuerySchema = z.object({
  search: z.string().max(200).optional(),
  role: z.enum(['USER', 'CREATOR', 'ADMIN']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const adminUserUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['USER', 'CREATOR', 'ADMIN']).optional(),
  banned: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/admin/users — List users with pagination, search, role filter
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const [query, qErr] = parseOrError(adminUserQuerySchema, {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (qErr) {
      return errorResponse(qErr.error, 400, qErr.details);
    }

    const { offset, limit, page } = paginationOffset(query.page, query.limit);

    const where: Record<string, unknown> = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(users, total, page, limit));
  });
}

// ---------------------------------------------------------------------------
// PUT /api/admin/users — Update user role or ban/unban
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole('ADMIN');

    const body = await request.json();
    const [data, validationError] = parseOrError(adminUserUpdateSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    const updated = await prisma.user.update({
      where: { id: data.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  });
}
