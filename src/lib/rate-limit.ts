import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    Number(process.env.API_RATE_LIMIT_REQUESTS) || 100,
    `${process.env.API_RATE_LIMIT_WINDOW || 60} s`
  ),
});