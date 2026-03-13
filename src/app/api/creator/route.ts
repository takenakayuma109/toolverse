import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { creatorProfileSchema, parseOrError } from '@/lib/validations';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/creator — Get current user's creator profile (auth required)
// ---------------------------------------------------------------------------

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        tools: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!creator) {
      return errorResponse('Creator profile not found', 404);
    }

    return NextResponse.json(creator);
  });
}

// ---------------------------------------------------------------------------
// POST /api/creator — Become a creator (upgrade user role, auth required)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    // Check if already a creator
    const existingCreator = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (existingCreator) {
      return errorResponse('You are already a creator', 409);
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(creatorProfileSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    // Create the creator profile and upgrade the user role in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creator = await prisma.$transaction(async (tx: any) => {
      // Upgrade user role to creator (unless they're already an admin)
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user && user.role === 'USER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'CREATOR' },
        });
      }

      return tx.creatorProfile.create({
        data: {
          userId,
          displayName: data.displayName,
          bio: data.bio ?? null,
          website: data.website ?? null,
        },
      });
    });

    return NextResponse.json(creator, { status: 201 });
  });
}

// ---------------------------------------------------------------------------
// PUT /api/creator — Update creator profile (creator role required)
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;

    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
      return errorResponse('Creator role required', 403);
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(creatorProfileSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    const creator = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) {
      return errorResponse('Creator profile not found', 404);
    }

    const updated = await prisma.creatorProfile.update({
      where: { userId },
      data: {
        displayName: data.displayName,
        bio: data.bio ?? null,
        website: data.website ?? null,
      },
    });

    return NextResponse.json(updated);
  });
}
