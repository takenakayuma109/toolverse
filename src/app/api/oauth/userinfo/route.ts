import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/oauth-server';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/oauth/userinfo — Return user info from Bearer token
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid Authorization header', 401);
    }

    const token = authHeader.slice(7);

    let payload: { sub: string; toolId: string; clientId: string };
    try {
      payload = await verifyAccessToken(token);
    } catch {
      return errorResponse('Invalid or expired access token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return NextResponse.json({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.avatar,
    });
  });
}
