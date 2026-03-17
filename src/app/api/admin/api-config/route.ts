import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/api-config
 * List all provider configs and platform settings.
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const [providerConfigs, platformConfigs] = await Promise.all([
    prisma.apiProviderConfig.findMany({ orderBy: [{ provider: 'asc' }, { model: 'asc' }] }),
    prisma.platformConfig.findMany({ orderBy: { key: 'asc' } }),
  ]);

  return NextResponse.json({
    providers: providerConfigs.map((c) => ({
      id: c.id,
      provider: c.provider,
      model: c.model,
      inputPricePerM: Number(c.inputPricePerM),
      outputPricePerM: Number(c.outputPricePerM),
      isActive: c.isActive,
      updatedAt: c.updatedAt.toISOString(),
    })),
    platform: platformConfigs.map((c) => ({
      id: c.id,
      key: c.key,
      value: c.value,
      updatedAt: c.updatedAt.toISOString(),
    })),
  });
}

/**
 * PUT /api/admin/api-config
 * Update markup rate or provider pricing.
 */
export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type } = body;

  // Update platform config (e.g. markup_rate)
  if (type === 'platform') {
    const { key, value } = body;
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const config = await prisma.platformConfig.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });

    logger.info('Platform config updated', { key, value: String(value) });
    return NextResponse.json({
      id: config.id,
      key: config.key,
      value: config.value,
      updatedAt: config.updatedAt.toISOString(),
    });
  }

  // Update provider config (pricing)
  if (type === 'provider') {
    const { id, inputPricePerM, outputPricePerM, isActive } = body;
    if (!id) {
      return NextResponse.json({ error: 'Provider config id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (inputPricePerM !== undefined) updateData.inputPricePerM = inputPricePerM;
    if (outputPricePerM !== undefined) updateData.outputPricePerM = outputPricePerM;
    if (isActive !== undefined) updateData.isActive = isActive;

    const config = await prisma.apiProviderConfig.update({
      where: { id },
      data: updateData,
    });

    logger.info('Provider config updated', { id, provider: config.provider, model: config.model });
    return NextResponse.json({
      id: config.id,
      provider: config.provider,
      model: config.model,
      inputPricePerM: Number(config.inputPricePerM),
      outputPricePerM: Number(config.outputPricePerM),
      isActive: config.isActive,
      updatedAt: config.updatedAt.toISOString(),
    });
  }

  return NextResponse.json({ error: 'Invalid type. Use "platform" or "provider".' }, { status: 400 });
}
