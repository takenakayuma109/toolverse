import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { userUpdateSchema, parseOrError } from '@/lib/validations';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/user — Get current user profile (auth required)
// ---------------------------------------------------------------------------

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return NextResponse.json(user);
  });
}

// ---------------------------------------------------------------------------
// PUT /api/user — Update current user profile (auth required)
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const body = await request.json();
    const [data, validationError] = parseOrError(userUpdateSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.locale !== undefined) updateData.locale = data.locale;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  });
}
