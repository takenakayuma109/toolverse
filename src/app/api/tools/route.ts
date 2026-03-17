import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import {
  toolCreateSchema,
  toolSearchSchema,
  parseOrError,
  paginationOffset,
} from '@/lib/validations';
import { slugify, errorResponse, withErrorHandler, paginatedResponse } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/tools — List tools with filtering, search, sort & pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);

    // Parse query params through Zod
    const raw = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      pricing: searchParams.get('pricing') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const [params, validationError] = parseOrError(toolSearchSchema, raw);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    const { offset, limit, page } = paginationOffset(params.page, params.limit);

    // Build Prisma where clause
    const where: Record<string, unknown> = {
      status: 'PUBLISHED', // Public listing only shows published tools
    };

    if (params.category) {
      where.category = params.category;
    }

    if (params.pricing) {
      where.pricingType = params.pricing;
    }

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        { tags: { hasSome: [params.q] } },
      ];
    }

    // Build orderBy
    let orderBy: Record<string, string>;
    switch (params.sort) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'users':
        orderBy = { userCount: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'trending':
      default:
        orderBy = { userCount: 'desc' }; // proxy for trending
        break;
    }

    const [items, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          creator: {
            select: { userId: true, displayName: true },
          },
        },
      }),
      prisma.tool.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(items, total, page, limit));
  });
}

// ---------------------------------------------------------------------------
// POST /api/tools — Create a new tool (requires creator or admin role)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;

    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
      return errorResponse('Creator or admin role required', 403);
    }

    const body = await request.json();
    const [data, validationError] = parseOrError(toolCreateSchema, body);
    if (validationError) {
      return errorResponse(validationError.error, 400, validationError.details);
    }

    // Generate slug from name if not provided
    const baseSlug = data.slug || slugify(data.name);

    // Ensure slug uniqueness by appending a short suffix if needed
    let slug = baseSlug;
    const existing = await prisma.tool.findUnique({ where: { slug } });
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // Look up the creator profile for this user
    const creator = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) {
      return errorResponse('Creator profile not found. Please create a creator profile first.', 400);
    }

    const tool = await prisma.tool.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        longDescription: data.longDescription ?? null,
        icon: data.icon ?? '',
        category: data.category,
        pricingType: data.pricing.type,
        price: data.pricing.price ?? null,
        currency: data.pricing.currency ?? null,
        period: data.pricing.period ?? null,
        tags: data.tags,
        serviceUrl: data.serviceUrl ?? null,
        screenshots: data.screenshots ?? [],
        targetCountries: data.targetCountries ?? [],
        status: 'DRAFT',
        rating: 0,
        reviewCount: 0,
        userCount: 0,
        isOfficial: false,
        isFeatured: false,
        isTrending: false,
        creatorId: creator.userId,
      },
    });

    return NextResponse.json(tool, { status: 201 });
  });
}
