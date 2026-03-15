/**
 * MAU (Monthly Active User) limits per billing plan.
 * null = unlimited.
 */
export const MAU_LIMITS: Record<string, number | null> = {
  free: 1_000,
  pro: 50_000,
  team: null,
  enterprise: null,
};

/** Default limit when no billing plan is found (free tier). */
export const DEFAULT_MAU_LIMIT = MAU_LIMITS.free!;
