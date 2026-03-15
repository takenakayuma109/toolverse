import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exchangeCodeForToken } from '@/lib/oauth-server';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// POST /api/oauth/token — Exchange auth code for access token
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { grant_type, code, client_id, client_secret, redirect_uri } = body;

    if (grant_type !== 'authorization_code') {
      return errorResponse('Unsupported grant_type. Must be "authorization_code"', 400);
    }

    if (!code || !client_id || !client_secret || !redirect_uri) {
      return errorResponse(
        'code, client_id, client_secret, and redirect_uri are required',
        400,
      );
    }

    // Credential validator: look up tool and compare hashed secret
    async function validateCredentials(
      clientId: string,
      clientSecret: string,
    ): Promise<boolean> {
      const tool = await prisma.tool.findFirst({
        where: { id: clientId },
      });
      if (!tool) return false;

      // The hashed secret is stored in webhookUrl with prefix "__oauth_secret__:"
      // This is an MVP convention; a dedicated OAuthClient model should replace this.
      const prefix = '__oauth_secret__:';
      if (!tool.webhookUrl?.startsWith(prefix)) return false;

      const hash = tool.webhookUrl.slice(prefix.length);
      return bcrypt.compare(clientSecret, hash);
    }

    try {
      const { accessToken, expiresIn } = await exchangeCodeForToken(
        code,
        client_id,
        client_secret,
        redirect_uri,
        validateCredentials,
      );

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token exchange failed';
      return errorResponse(message, 400);
    }
  });
}
