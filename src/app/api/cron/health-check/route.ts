import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// GET /api/cron/health-check — Ping all published tools' service URLs
// Scheduled: every 15 minutes via Vercel cron
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tools = await prisma.tool.findMany({
      where: {
        status: 'PUBLISHED',
        serviceUrl: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        serviceUrl: true,
      },
    });

    logger.info('Health check started', { toolCount: tools.length });

    const results = await Promise.allSettled(
      tools.map(async (tool) => {
        const serviceUrl = tool.serviceUrl!;
        const manifestUrl = serviceUrl.replace(/\/$/, '') + '/.well-known/toolverse.json';

        const [serviceResult, manifestResult] = await Promise.allSettled([
          fetch(serviceUrl, { method: 'HEAD', signal: AbortSignal.timeout(10_000) }),
          fetch(manifestUrl, { signal: AbortSignal.timeout(10_000) }),
        ]);

        const serviceOk =
          serviceResult.status === 'fulfilled' && serviceResult.value.ok;
        const manifestOk =
          manifestResult.status === 'fulfilled' && manifestResult.value.ok;

        const result = {
          toolId: tool.id,
          slug: tool.slug,
          serviceUrl,
          serviceOk,
          manifestOk,
        };

        if (!serviceOk || !manifestOk) {
          logger.warn('Health check failed', {
            toolId: tool.id,
            slug: tool.slug,
            serviceOk,
            manifestOk,
            serviceError:
              serviceResult.status === 'rejected'
                ? String(serviceResult.reason)
                : undefined,
            manifestError:
              manifestResult.status === 'rejected'
                ? String(manifestResult.reason)
                : undefined,
          });
        }

        return result;
      }),
    );

    const summary = {
      total: tools.length,
      healthy: results.filter(
        (r) =>
          r.status === 'fulfilled' && r.value.serviceOk && r.value.manifestOk,
      ).length,
      unhealthy: results.filter(
        (r) =>
          r.status === 'rejected' ||
          (r.status === 'fulfilled' &&
            (!r.value.serviceOk || !r.value.manifestOk)),
      ).length,
    };

    logger.info('Health check completed', summary);

    return NextResponse.json({
      success: true,
      ...summary,
      results: results.map((r) =>
        r.status === 'fulfilled'
          ? r.value
          : { error: String(r.reason) },
      ),
    });
  } catch (error) {
    logger.error('Health check cron failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 },
    );
  }
}
