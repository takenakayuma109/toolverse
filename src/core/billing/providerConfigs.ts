// Default provider pricing data (USD per 1M tokens)
// These are used to seed the ApiProviderConfig table.

export interface ProviderPricing {
  provider: string;
  model: string;
  inputPricePerM: number;  // USD per 1M input tokens
  outputPricePerM: number; // USD per 1M output tokens
}

export const DEFAULT_PROVIDER_CONFIGS: ProviderPricing[] = [
  // OpenAI
  { provider: 'openai', model: 'gpt-4o', inputPricePerM: 2.5, outputPricePerM: 10.0 },
  { provider: 'openai', model: 'gpt-4o-mini', inputPricePerM: 0.15, outputPricePerM: 0.6 },
  // Anthropic
  { provider: 'anthropic', model: 'claude-sonnet-4-20250514', inputPricePerM: 3.0, outputPricePerM: 15.0 },
  { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', inputPricePerM: 0.8, outputPricePerM: 4.0 },
  // Google
  { provider: 'google', model: 'gemini-1.5-pro', inputPricePerM: 1.25, outputPricePerM: 5.0 },
  { provider: 'google', model: 'gemini-1.5-flash', inputPricePerM: 0.075, outputPricePerM: 0.3 },
];

export const DEFAULT_MARKUP_RATE = 0.2; // 20%
