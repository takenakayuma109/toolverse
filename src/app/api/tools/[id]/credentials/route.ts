import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// POST /api/tools/[id]/credentials — Generate client_id & client_secret
// ---------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id: toolId } = await params;

    // Verify the tool exists and belongs to this user
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: { creator: true },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    if (tool.creator.userId !== userId) {
      return errorResponse('You can only manage credentials for your own tools', 403);
    }

    // Generate credentials
    // client_id is the tool ID itself (stable, public)
    const clientId = tool.id;
    const clientSecret = `tvs_${crypto.randomBytes(32).toString('hex')}`;

    // Hash the secret before storing
    const clientSecretHash = await bcrypt.hash(clientSecret, 12);

    // Store the hashed secret on the tool record.
    // We use a raw update to set a JSON metadata approach since the schema
    // doesn't have a dedicated column yet. We repurpose the apiEndpoint field
    // or add a future migration. For now, store as a raw SQL update on a
    // convention basis, or update the tool with available fields.
    //
    // Since Prisma schema doesn't have clientSecretHash, we use $executeRaw
    // to store it. In production, add a proper column via migration.
    // For MVP, we'll store it in the tool metadata via a raw query.
    await prisma.$executeRawUnsafe(
      `UPDATE "Tool" SET "webhookUrl" = $1 WHERE "id" = $2`,
      `__oauth_secret__:${clientSecretHash}`,
      toolId,
    );

    // Update auth method to OAuth2
    await prisma.tool.update({
      where: { id: toolId },
      data: { authMethod: 'OAUTH2' },
    });

    // Return the secret ONCE — it cannot be retrieved again
    return NextResponse.json(
      {
        client_id: clientId,
        client_secret: clientSecret,
        message: 'Store the client_secret securely. It will not be shown again.',
      },
      { status: 201 },
    );
  });
}

// ---------------------------------------------------------------------------
// GET /api/tools/[id]/credentials — Return client_id (never the secret)
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id: toolId } = await params;

    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: { creator: true },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    if (tool.creator.userId !== userId) {
      return errorResponse('You can only view credentials for your own tools', 403);
    }

    const hasCredentials =
      tool.authMethod === 'OAUTH2' &&
      tool.webhookUrl?.startsWith('__oauth_secret__:');

    return NextResponse.json({
      client_id: tool.id,
      has_credentials: hasCredentials,
      auth_method: tool.authMethod,
    });
  });
}
