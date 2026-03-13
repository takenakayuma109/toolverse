import { NextResponse } from 'next/server';

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Standard JSON error response.
 */
export function errorResponse(
  error: string,
  status: number,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    { error, ...(details !== undefined ? { details } : {}) },
    { status }
  );
}

/**
 * Wrap an API handler with try/catch that returns proper error JSON.
 * Handles thrown NextResponse objects from requireAuth/requireRole.
 */
export async function withErrorHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    // requireAuth / requireRole throw NextResponse instances
    if (err instanceof NextResponse) {
      return err;
    }
    console.error('API Error:', err);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * Build a paginated response envelope.
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}
