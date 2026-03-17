import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { checkRateLimit } from '@/lib/rate-limit';
import { parseOrError } from '@/lib/validations';
import { llmProxyRequestSchema } from '@/lib/validations';
import { callLLM } from '@/lib/llm-providers';
import { calculateCost } from '@/core/billing/costCalculator';
import { hasEnoughCredits, deductCredits } from '@/core/billing/creditService';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/proxy/llm
 * Proxies LLM API calls with credit-based billing.
 */
export async function POST(request: NextRequest) {
  // 1. Authentication
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }
  const userId = (session.user as { id: string }).id;

  // 2. Rate limiting (20 req/min per user for LLM proxy)
  const rateLimit = await checkRateLimit(`llm:${userId}`, false);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfterMs: rateLimit.retryAfterMs },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      },
    );
  }

  // 3. Parse & validate request body
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const [data, validationError] = parseOrError(llmProxyRequestSchema, body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const { provider, model, messages, toolId, maxTokens, temperature } = data;

  // 4. Check credit balance (estimate minimum cost)
  const balance = await hasEnoughCredits(userId, 0.0001); // at least some credits
  if (!balance) {
    return NextResponse.json(
      { error: 'Insufficient credits. Please purchase credits to continue.' },
      { status: 402 },
    );
  }

  // 5. Call the LLM provider
  let llmResponse;
  try {
    llmResponse = await callLLM({
      provider,
      model,
      messages,
      maxTokens,
      temperature,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM provider error';
    logger.error('LLM proxy call failed', { provider, model, error: message });
    return NextResponse.json(
      { error: `Provider error: ${message}` },
      { status: 502 },
    );
  }

  // 6. Calculate cost
  let cost;
  try {
    cost = await calculateCost(
      provider,
      model,
      llmResponse.inputTokens,
      llmResponse.outputTokens,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cost calculation error';
    logger.error('Cost calculation failed', { provider, model, error: message });
    return NextResponse.json(
      { error: `Billing error: ${message}` },
      { status: 500 },
    );
  }

  // 7. Check if user actually has enough credits for the computed cost
  const hasCredits = await hasEnoughCredits(userId, cost.markedUpCost);
  if (!hasCredits) {
    return NextResponse.json(
      {
        error: 'Insufficient credits for this request',
        required: cost.markedUpCost,
        cost: cost,
      },
      { status: 402 },
    );
  }

  // 8. Record usage and deduct credits atomically
  try {
    await prisma.apiUsageRecord.create({
      data: {
        userId,
        toolId: toolId ?? null,
        provider,
        model,
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
        rawCost: cost.rawCost,
        markupRate: cost.markupRate,
        markedUpCost: cost.markedUpCost,
        durationMs: llmResponse.durationMs,
      },
    });

    await deductCredits(userId, cost.markedUpCost, `LLM usage: ${provider}/${model}`, {
      provider,
      model,
      inputTokens: llmResponse.inputTokens,
      outputTokens: llmResponse.outputTokens,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Billing record error';
    logger.error('Failed to record usage/deduct credits', { userId, error: message });
    // Still return the response — the LLM call succeeded, we log the billing failure
  }

  // 9. Return response
  return NextResponse.json({
    content: llmResponse.content,
    model: llmResponse.model,
    finishReason: llmResponse.finishReason,
    usage: {
      inputTokens: llmResponse.inputTokens,
      outputTokens: llmResponse.outputTokens,
    },
    cost: {
      raw: cost.rawCost,
      markupRate: cost.markupRate,
      total: cost.markedUpCost,
    },
    durationMs: llmResponse.durationMs,
  });
}
