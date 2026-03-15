import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { generateAuthCode } from '@/lib/oauth-server';
import { withErrorHandler, errorResponse } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/oauth/authorize — OAuth authorization endpoint
// Validates client_id, generates auth code, redirects to redirect_uri
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');
    const responseType = searchParams.get('response_type');

    if (!clientId || !redirectUri) {
      return errorResponse('client_id and redirect_uri are required', 400);
    }

    if (responseType !== 'code') {
      return errorResponse('response_type must be "code"', 400);
    }

    // Validate that the client_id belongs to a registered tool
    const tool = await prisma.tool.findFirst({
      where: { id: clientId, status: 'PUBLISHED' },
    });

    if (!tool) {
      return errorResponse('Invalid client_id', 400);
    }

    // Generate auth code
    const code = generateAuthCode(userId, tool.id, clientId, redirectUri);

    // Build redirect URL with code and optional state
    const redirect = new URL(redirectUri);
    redirect.searchParams.set('code', code);
    if (state) {
      redirect.searchParams.set('state', state);
    }

    return NextResponse.redirect(redirect.toString());
  });
}
