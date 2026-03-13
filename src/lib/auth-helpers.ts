import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Get the current server session.
 * Works in API routes and Server Components.
 */
export async function getServerSession() {
  return auth();
}

/**
 * Require authentication. Returns the session or throws a 401 JSON response.
 * Use in API route handlers:
 *
 *   const session = await requireAuth();
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Require a specific role. Returns the session or throws 401/403.
 * Use in API route handlers:
 *
 *   const session = await requireRole('admin');
 */
export async function requireRole(role: string) {
  const session = await requireAuth();

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== role) {
    throw NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return session;
}
