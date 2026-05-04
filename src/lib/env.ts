/**
 * Environment Variable Validation
 * Run at startup to catch missing/invalid configuration immediately.
 * Uses Zod for schema definition and precise error messages.
 */

import { z } from 'zod';
import logger from '@/lib/logger';

// ─── Schema ──────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Supabase (required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is too short'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY is too short'),

  // AI (at least Gemini OR Claude required)
  GOOGLE_GENAI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Voice
  ELEVENLABS_API_KEY: z.string().optional(),

  // Video
  MUX_TOKEN_ID: z.string().optional(),
  MUX_TOKEN_SECRET: z.string().optional(),
  MUX_WEBHOOK_SECRET: z.string().optional(),

  // Avatar
  HEYGEN_API_KEY: z.string().optional(),
  HEYGEN_WEBHOOK_SECRET: z.string().optional(),

  // Footage
  PEXELS_API_KEY: z.string().optional(),

  // Background Jobs
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@voxara.app'),

  // Payments
  PADDLE_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string().optional(),

  // Rate limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal('')),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Social OAuth
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),

  // Remotion (optional — passthrough mode used if absent)
  RENDER_BACKEND: z.enum(['auto', 'local', 'lambda']).default('auto'),
  REMOTION_LAMBDA_FUNCTION_NAME: z.string().optional(),
  REMOTION_SERVE_URL: z.string().url().optional().or(z.literal('')),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Admin
  ADMIN_USER_IDS: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

// ─── Validation ───────────────────────────────────────────────────────────────

let _env: Env | null = null;

/**
 * Validate and return typed environment variables.
 * Results are cached after first call.
 * Throws in production on missing critical vars.
 */
export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.errors
      .map((e: any) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    const message = `Environment validation failed:\n${issues}`;

    if (process.env.NODE_ENV === 'production') {
      // Hard crash in production — missing vars = broken deployment
      throw new Error(message);
    } else {
      // Warn in development — allow partial config for local testing
      logger.warn(message);
    }
  }

  _env = (result.data ?? process.env) as Env;
  return _env;
}

/**
 * Validate at module load time (called from next.config.js / instrumentation).
 * Logs a success/failure summary.
 */
export function validateEnv(): void {
  try {
    getEnv();
    logger.info('✓ Environment variables validated');
  } catch (err) {
    logger.error('✗ Environment validation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    if (process.env.NODE_ENV === 'production') {
      // process.exit() is not available in Edge Runtime — throw instead.
      // This surfaces as a 500 at the first request, with a clear error message.
      throw new Error('Server misconfigured: required environment variables are missing. Check deployment logs.');
    }
  }
}

// Re-export for convenience
export const env = new Proxy({} as Env, {
  get(_, key) {
    return getEnv()[key as keyof Env];
  },
});
