import { createHmac } from 'crypto';
import { logger } from '@/lib/logger';

/**
 * Send a signed webhook to a developer app endpoint.
 *
 * Signs the payload with HMAC-SHA256 using the provided secret and sets
 * standard Toolverse webhook headers for verification.
 */
export async function sendWebhook(
  webhookUrl: string,
  secret: string,
  event: string,
  payload: object,
): Promise<{ ok: boolean; status: number }> {
  const body = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signatureInput = `${timestamp}.${body}`;
  const signature = createHmac('sha256', secret)
    .update(signatureInput)
    .digest('hex');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Toolverse-Signature': `t=${timestamp},v1=${signature}`,
        'X-Toolverse-Event': event,
      },
      body,
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    logger.info('Webhook delivered', {
      event,
      url: webhookUrl,
      status: response.status,
    });

    return { ok: response.ok, status: response.status };
  } catch (error) {
    logger.error('Webhook delivery failed', {
      event,
      url: webhookUrl,
      error: error instanceof Error ? error.message : String(error),
    });

    return { ok: false, status: 0 };
  }
}
