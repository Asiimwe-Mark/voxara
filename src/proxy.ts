// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// Imported from our clean, isolated Edge utility file to prevent tracing crashes
import { applySecurityHeaders, getClientIp, isValidOrigin } from "@/lib/edge-security";

// Safe initialization for Upstash (REST over HTTP works perfectly in Next 16 Edge)
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

// Named export 'proxy' is the official standard for Next.js 16
export async function proxy(request: NextRequest) {
  
  // 1. Validate incoming origins on your internal API routes
  if (request.nextUrl.pathname.startsWith("/api/") && !isValidOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403 }
    );
  }

  // 2. Execute Upstash Rate Limiting on v1 API routes
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

  // 3. Keep the user auth session alive (Supabase cookies)
  let response = await updateSession(request);
  
  // 4. Inject structural security headers into the response payload
  response = applySecurityHeaders(response);

  return response;
}

export const config = {
  // Explicitly forces Turbopack to isolate compilation to the Edge Runtime
  runtime: "edge",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};