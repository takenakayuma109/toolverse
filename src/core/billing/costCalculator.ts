import { prisma } from '@/lib/db';
import { DEFAULT_MARKUP_RATE } from './providerConfigs';

export interface CostBreakdown {
  rawCost: number;       // cost at provider rate (USD)
  markupRate: number;    // e.g. 0.20
  markedUpCost: number;  // rawCost * (1 + markupRate) — what user pays
}

/**
 * Get the current markup rate from PlatformConfig, or fall back to default.
 */
export async function getMarkupRate(): Promise<number> {
  const config = await prisma.platformConfig.findUnique({
    where: { key: 'markup_rate' },
  });
  if (config) {
    const parsed = parseFloat(config.value);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_MARKUP_RATE;
}

/**
 * Calculate the cost for an LLM API call based on provider config in DB.
 */
export async function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<CostBreakdown> {
  const config = await prisma.apiProviderConfig.findUnique({
    where: { provider_model: { provider, model } },
  });

  if (!config) {
    throw new Error(`No pricing config found for ${provider}/${model}`);
  }

  const inputCost = (inputTokens / 1_000_000) * Number(config.inputPricePerM);
  const outputCost = (outputTokens / 1_000_000) * Number(config.outputPricePerM);
  const rawCost = inputCost + outputCost;

  const markupRate = await getMarkupRate();
  const markedUpCost = rawCost * (1 + markupRate);

  return { rawCost, markupRate, markedUpCost };
}

/**
 * Estimate cost before making the actual API call (for pre-flight checks).
 * Uses estimated output tokens since actual output is unknown.
 */
export async function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  estimatedOutputTokens: number,
): Promise<CostBreakdown> {
  return calculateCost(provider, model, inputTokens, estimatedOutputTokens);
}
