// ---------------------------------------------------------------------------
// Webhook error handling utilities
// ---------------------------------------------------------------------------
//
// Retry strategy:
//   - Critical events (checkout.session.completed, invoice.paid) return HTTP 500
//     so that Stripe retries them with exponential backoff (up to ~3 days).
//     These events affect payment state and must eventually succeed.
//   - Non-critical events (subscription updates, transfers, etc.) return HTTP 200
//     even on failure, so Stripe does NOT retry. The error is logged for manual
//     investigation. These events are informational or can self-heal on the next
//     webhook delivery.
// ---------------------------------------------------------------------------

/**
 * Event types where handler failure should trigger a Stripe retry (HTTP 500).
 * Add event types here only when data loss / inconsistency would result from
 * silently dropping the event.
 */
const CRITICAL_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'invoice.paid',
]);

export function isCriticalEvent(eventType: string): boolean {
  return CRITICAL_EVENT_TYPES.has(eventType);
}

/**
 * Log a webhook handler failure with full context.
 * Uses structured JSON so log aggregation tools (Datadog, Grafana, etc.)
 * can parse and alert on these entries.
 */
export function logWebhookError(
  eventType: string,
  eventId: string,
  error: unknown,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: 'error',
      source: 'stripe-webhook',
      eventType,
      eventId,
      message,
      ...(stack ? { stack } : {}),
      timestamp: new Date().toISOString(),
    }),
  );
}
