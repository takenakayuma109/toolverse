import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().startsWith('postgresql://'),
  AUTH_SECRET: z.string().min(16),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_BASE_URL: z.string().url(),

  // OAuth providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Upstash Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Analytics & monitoring (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Security (optional)
  ALLOWED_ORIGINS: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _validatedEnv: ServerEnv | null = null;

/**
 * Validates all required environment variables.
 * Call this at application startup (e.g., in instrumentation.ts or a server entrypoint).
 * Throws a descriptive error if any required variable is missing or invalid.
 */
export function validateEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Environment variable validation failed:\n${formatted}`
    );
  }

  _validatedEnv = result.data;
  return _validatedEnv;
}

/**
 * Lazy accessor for validated environment variables.
 * Returns the validated env if `validateEnv()` has been called,
 * otherwise falls back to reading `process.env` directly (unvalidated).
 */
export const env: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    if (_validatedEnv) {
      return _validatedEnv[prop as keyof ServerEnv];
    }
    return process.env[prop];
  },
});
