import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { applySecurityHeaders, getClientIp, isValidOrigin } from "@/lib/security";

// Only instantiate when env vars are set (avoids build-time crash)
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.API_RATE_LIMIT_REQUESTS) || 100,
      `${Number(process.env.API_RATE_LIMIT_WINDOW) || 60} s`
    ),
    analytics: true,
  });
}

export async function proxy(request: NextRequest) {
  // Validate origin for API requests
  if (request.nextUrl.pathname.startsWith("/api/") && !isValidOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403 }
    );
  }

  // Rate-limit public API (v1) endpoints
  if (ratelimit && request.nextUrl.pathname.startsWith("/api/v1/")) {
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  // Update Supabase auth session (refreshes JWT in cookies)
  let response = await updateSession(request);
  
  // Apply security headers
  response = applySecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
