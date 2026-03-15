import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AuthCodeEntry {
  userId: string;
  toolId: string;
  clientId: string;
  redirectUri: string;
  expiresAt: number;
}

interface TokenPayload {
  sub: string;
  toolId: string;
  clientId: string;
}

// ─── In-memory auth code store (swap for Redis later) ───────────────────────

const authCodes = new Map<string, AuthCodeEntry>();

// Periodic cleanup of expired codes
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of authCodes) {
    if (entry.expiresAt < now) {
      authCodes.delete(code);
    }
  }
}, 60_000);

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getSigningKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

// ─── Core OAuth functions ───────────────────────────────────────────────────────

/**
 * Generate a short-lived authorization code (10 minutes).
 */
export function generateAuthCode(
  userId: string,
  toolId: string,
  clientId: string,
  redirectUri: string,
): string {
  const code = crypto.randomBytes(32).toString('hex');
  authCodes.set(code, {
    userId,
    toolId,
    clientId,
    redirectUri,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return code;
}

/**
 * Exchange an authorization code for a JWT access token.
 * Returns the signed JWT or throws on invalid/expired code.
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  validateCredentials: (clientId: string, clientSecret: string) => Promise<boolean>,
): Promise<{ accessToken: string; expiresIn: number }> {
  const entry = authCodes.get(code);
  if (!entry) {
    throw new Error('Invalid or expired authorization code');
  }

  // Delete immediately to prevent replay
  authCodes.delete(code);

  if (entry.expiresAt < Date.now()) {
    throw new Error('Authorization code has expired');
  }

  if (entry.clientId !== clientId) {
    throw new Error('client_id mismatch');
  }

  if (entry.redirectUri !== redirectUri) {
    throw new Error('redirect_uri mismatch');
  }

  // Validate client credentials
  const isValid = await validateCredentials(clientId, clientSecret);
  if (!isValid) {
    throw new Error('Invalid client credentials');
  }

  const expiresIn = 3600; // 1 hour

  const accessToken = await new SignJWT({
    sub: entry.userId,
    toolId: entry.toolId,
    clientId,
  } satisfies TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .setIssuer('toolverse')
    .sign(getSigningKey());

  return { accessToken, expiresIn };
}

/**
 * Verify a JWT access token and return the decoded payload.
 */
export async function verifyAccessToken(
  token: string,
): Promise<{ sub: string; toolId: string; clientId: string }> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: 'toolverse',
    });

    return {
      sub: payload.sub as string,
      toolId: payload.toolId as string,
      clientId: payload.clientId as string,
    };
  } catch {
    throw new Error('Invalid or expired access token');
  }
}
