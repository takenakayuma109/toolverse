import { logger } from '@/lib/logger';

// ─── Common Types ──────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  provider: string;
  model: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  finishReason: string;
  durationMs: number;
}

// ─── Provider Implementations ──────────────────────────────────────────────────

async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const start = Date.now();
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('OpenAI API error', { status: response.status, body: errorBody });
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - start;

  return {
    content: data.choices[0]?.message?.content ?? '',
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    model: data.model ?? request.model,
    finishReason: data.choices[0]?.finish_reason ?? 'unknown',
    durationMs,
  };
}

async function callAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  // Separate system message from conversation messages
  const systemMessage = request.messages.find(m => m.role === 'system')?.content;
  const conversationMessages = request.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const start = Date.now();
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
      ...(systemMessage ? { system: systemMessage } : {}),
      messages: conversationMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('Anthropic API error', { status: response.status, body: errorBody });
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - start;

  return {
    content: data.content?.[0]?.text ?? '',
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    model: data.model ?? request.model,
    finishReason: data.stop_reason ?? 'unknown',
    durationMs,
  };
}

async function callGoogle(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY?.trim();
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not configured');

  // Convert messages to Google's format
  const systemInstruction = request.messages.find(m => m.role === 'system')?.content;
  const contents = request.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('Google AI API error', { status: response.status, body: errorBody });
    throw new Error(`Google AI API error: ${response.status}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - start;

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    model: request.model,
    finishReason: data.candidates?.[0]?.finishReason ?? 'unknown',
    durationMs,
  };
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

const PROVIDERS: Record<string, (req: LLMRequest) => Promise<LLMResponse>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  google: callGoogle,
};

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const handler = PROVIDERS[request.provider];
  if (!handler) {
    throw new Error(`Unsupported provider: ${request.provider}`);
  }
  return handler(request);
}
