import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { toolUpdateSchema, parseOrError } from '@/lib/validations';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/tools/[id] — Get a single tool by id or slug (public)
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const { id } = await params;

    // Try finding by ID first, then by slug
    const tool =
      (await prisma.tool.findUnique({
        where: { id },
        include: {
          creator: { select: { userId: true, displayName: true } },
        },
      })) ??
      (await prisma.tool.findUnique({
        where: { slug: id },
        include: {
          creator: { select: { userId: true, displayName: true } },
        },
      }));

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    return NextResponse.json(tool);
  });
}

// ---------------------------------------------------------------------------
// PUT /api/tools/[id] — Update a tool (creator owner or admin)
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;
    const { id } = await params;

    const tool = await prisma.tool.findUnique({
      where: { id },
      include: { creator: { select: { userId: true } } },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    // Only the tool's creator or an admin may update
    if (tool.creator.userId !== userId && userRole !== 'ADMIN') {
      return errorResponse('You do not have permission to update this tool', 403);
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(toolUpdateSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    // Build update payload, mapping nested pricing fields to flat columns
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.longDescription !== undefined) updateData.longDescription = data.longDescription;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.serviceUrl !== undefined) updateData.serviceUrl = data.serviceUrl;
    if (data.screenshots !== undefined) updateData.screenshots = data.screenshots;
    if (data.targetCountries !== undefined) updateData.targetCountries = data.targetCountries;

    if (data.pricing) {
      updateData.pricingType = data.pricing.type;
      if (data.pricing.price !== undefined) updateData.price = data.pricing.price;
      if (data.pricing.currency !== undefined) updateData.currency = data.pricing.currency;
      if (data.pricing.period !== undefined) updateData.period = data.pricing.period;
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  });
}

// ---------------------------------------------------------------------------
// DELETE /api/tools/[id] — Delete a tool (creator owner or admin)
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;
    const { id } = await params;

    const tool = await prisma.tool.findUnique({
      where: { id },
      include: { creator: { select: { userId: true } } },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    if (tool.creator.userId !== userId && userRole !== 'ADMIN') {
      return errorResponse('You do not have permission to delete this tool', 403);
    }

    await prisma.tool.delete({ where: { id } });

    return NextResponse.json({ success: true });
  });
}
