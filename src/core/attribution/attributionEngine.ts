/**
 * Revenue Attribution Engine
 *
 * Determines whether a purchase was attributed to Toolverse
 * by checking Stripe metadata for the required parameters.
 *
 * URL format: ?ref=toolverse&tool_id={tool_id}&creator_id={creator_id}&session_id={session_id}
 * Stripe metadata: { ref: "toolverse", tool_id, creator_id, session_id }
 */

export function isToolverseAttributed(
  metadata: Record<string, string | undefined>,
): boolean {
  return (
    metadata?.ref === 'toolverse' &&
    !!metadata?.tool_id &&
    !!metadata?.creator_id
  );
}

export function extractAttribution(metadata: Record<string, string | undefined>) {
  return {
    toolId: metadata?.tool_id ?? null,
    creatorId: metadata?.creator_id ?? null,
    sessionId: metadata?.session_id ?? null,
  };
}
