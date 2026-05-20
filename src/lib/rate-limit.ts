import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiter — only instantiated when Upstash env vars are present.
 * Prevents build-time crashes in environments without Redis configured.
 */
function createRatelimiter(): Ratelimit {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // In production, log a warning so missing Redis doesn't go unnoticed
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[rate-limit] WARNING: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. ' +
        'Rate limiting is DISABLED. This is a security risk in production.'
      );
    }
    // Return a no-op ratelimiter that always allows requests
    // (useful in local dev / CI where Redis isn't configured)
    return {
      limit: async () => ({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60_000,
        pending: Promise.resolve(),
      }),
    } as unknown as Ratelimit;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.API_RATE_LIMIT_REQUESTS) || 100,
      `${process.env.API_RATE_LIMIT_WINDOW || 60} s` as any
    ),
    analytics: true,
  });
}

export const ratelimit = createRatelimiter();
