import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET /api/health — Health check endpoint
// ---------------------------------------------------------------------------

export async function GET() {
  let dbHealthy = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    // DB is unavailable — report in body
  }

  return NextResponse.json({
    status: 'ok',
    services: {
      db: dbHealthy,
      redis: false, // Redis not yet integrated
    },
    timestamp: new Date().toISOString(),
  });
}
