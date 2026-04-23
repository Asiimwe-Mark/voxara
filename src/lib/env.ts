/**
 * Environment Variable Validation Schema
 * Validates all required and optional environment variables at runtime
 * Fails fast with clear error messages if any required variables are missing
 */

import { z } from 'zod';

const paddleEnvSchema = z.object({
  // Paddle Configuration (Required if using Paddle)
  PADDLE_VENDOR_ID: z.string().min(1, 'PADDLE_VENDOR_ID is required for Paddle provider'),
  PADDLE_API_KEY: z.string().min(1, 'PADDLE_API_KEY is required for Paddle provider'),
  PADDLE_WEBHOOK_SECRET: z.string().min(1, 'PADDLE_WEBHOOK_SECRET is required for Paddle provider'),
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z.string().min(1, 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is required for Paddle provider'),
  
  // Paddle Mode (sandbox vs production)
  PADDLE_SANDBOX_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),
  
  // Paddle Product/Plan IDs (Required for Paddle)
  PADDLE_PRO_PLAN_ID: z.string().min(1, 'PADDLE_PRO_PLAN_ID is required'),
  PADDLE_AGENCY_PLAN_ID: z.string().min(1, 'PADDLE_AGENCY_PLAN_ID is required'),
  PADDLE_CREDIT_PRODUCT_ID: z.string().min(1, 'PADDLE_CREDIT_PRODUCT_ID is required'),
});

const flutterwaveEnvSchema = z.object({
  // Flutterwave Configuration (Required if using Flutterwave)
  FLUTTERWAVE_PUBLIC_KEY: z.string().min(1, 'FLUTTERWAVE_PUBLIC_KEY is required for Flutterwave provider'),
  FLUTTERWAVE_SECRET_KEY: z.string().min(1, 'FLUTTERWAVE_SECRET_KEY is required for Flutterwave provider'),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string().min(1, 'FLUTTERWAVE_WEBHOOK_SECRET is required for Flutterwave provider'),
  FLUTTERWAVE_ENCRYPTION_KEY: z.string().min(1, 'FLUTTERWAVE_ENCRYPTION_KEY is required'),
  
  // Flutterwave Plan IDs (Optional for subscriptions)
  FLUTTERWAVE_PRO_PLAN_ID: z.string().optional(),
  FLUTTERWAVE_AGENCY_PLAN_ID: z.string().optional(),
});

const coreEnvSchema = z.object({
  // App Core Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // Payment Provider Selection
  PAYMENT_PROVIDER: z
    .enum(['paddle', 'flutterwave'])
    .default('paddle'),
  
  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  
  // Video Streaming (Mux)
  MUX_TOKEN_ID: z.string().min(1, 'MUX_TOKEN_ID is required'),
  MUX_TOKEN_SECRET: z.string().min(1, 'MUX_TOKEN_SECRET is required'),
  MUX_WEBHOOK_SECRET: z.string().min(1, 'MUX_WEBHOOK_SECRET is required'),
  
  // Background Jobs (Inngest)
  INNGEST_EVENT_KEY: z.string().min(1, 'INNGEST_EVENT_KEY is required'),
  INNGEST_SIGNING_KEY: z.string().min(1, 'INNGEST_SIGNING_KEY is required'),
  
  // Rate Limiting (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
  API_RATE_LIMIT_REQUESTS: z.string().regex(/^\d+$/, 'API_RATE_LIMIT_REQUESTS must be a number').default('100'),
  API_RATE_LIMIT_WINDOW: z.string().regex(/^\d+$/, 'API_RATE_LIMIT_WINDOW must be a number').default('60'),
});

const aiEnvSchema = z.object({
  // Google GenAI
  GOOGLE_GENAI_API_KEY: z.string().min(1, 'GOOGLE_GENAI_API_KEY is required'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, 'GOOGLE_GENERATIVE_AI_API_KEY is required'),
});

const socialEnvSchema = z.object({
  // Social Platform OAuth (Optional but recommended)
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_APP_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
});

const avatarEnvSchema = z.object({
  // Avatar Providers
  HEYGEN_API_KEY: z.string().min(1, 'HEYGEN_API_KEY is required'),
  HEYGEN_WEBHOOK_SECRET: z.string().min(1, 'HEYGEN_WEBHOOK_SECRET is required'),
  DID_API_KEY: z.string().optional(),
  SYNTHESIA_API_KEY: z.string().optional(),
  
  // Voice Cloning
  ELEVENLABS_API_KEY: z.string().min(1, 'ELEVENLABS_API_KEY is required'),
  
  // Stock Footage
  PEXELS_API_KEY: z.string().min(1, 'PEXELS_API_KEY is required'),
});

const monitoringEnvSchema = z.object({
  // Error Tracking & Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('NEXT_PUBLIC_SENTRY_DSN must be a valid URL').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('production'),
});

/**
 * Master validation schema combining all environments
 */
const envSchema = coreEnvSchema
  .merge(aiEnvSchema)
  .merge(socialEnvSchema)
  .merge(avatarEnvSchema)
  .merge(monitoringEnvSchema)
  .merge(
    z.object({
      PAYMENT_PROVIDER: z.enum(['paddle', 'flutterwave']).default('paddle'),
    })
  )
  .refine(
    (env) => {
      // If using Paddle, validate Paddle-specific env vars
      if (env.PAYMENT_PROVIDER === 'paddle') {
        const result = paddleEnvSchema.safeParse(process.env);
        return result.success;
      }
      return true;
    },
    { message: 'Missing required Paddle environment variables' }
  )
  .refine(
    (env) => {
      // If using Flutterwave, validate Flutterwave-specific env vars
      if (env.PAYMENT_PROVIDER === 'flutterwave') {
        const result = flutterwaveEnvSchema.safeParse(process.env);
        return result.success;
      }
      return true;
    },
    { message: 'Missing required Flutterwave environment variables' }
  );

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables at runtime
 * This function should be called once during application startup
 * 
 * @throws Error with detailed message if validation fails
 * @returns Validated environment object
 */
export function validateEnvironment(): Env {
  try {
    const env = envSchema.parse(process.env);
    console.log('✓ Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
      console.error('✗ Environment validation failed:\n' + issues);
      throw new Error(`Invalid environment variables:\n${issues}`);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * This is a singleton that validates once and caches
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnvironment();
  }
  return cachedEnv;
}

/**
 * Check if a specific environment variable is present
 */
export function hasEnv(key: keyof Env): boolean {
  const env = getEnv();
  return (env[key] as any) !== undefined && (env[key] as any) !== '';
}
