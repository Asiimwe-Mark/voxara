// lib/edge-security.ts
import { type NextRequest, NextResponse } from "next/server";

/**
 * Extracts the client IP using standard Web headers supported by Next.js 16 / Turbopack.
 */
export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Grab the actual client IP (first in the chain)
    return xForwardedFor.split(",")[0].trim();
  }
  return request.ip || "127.0.0.1";
}

/**
 * Validates the origin header using native browser/edge Web APIs instead of Node URL packages.
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // If there's no origin header (like standard direct page navigation), let it through
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    
    // Pass if the origin host matches your environment's host
    if (host && originUrl.host === host) return true;

    // Define allowed external origins if you have them
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      "https://localhost:3000"
    ].filter(Boolean);

    return allowedOrigins.includes(origin);
  } catch {
    return false;
  }
}

/**
 * Appends core security headers to the NextResponse object cleanly.
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers;

  headers.set("X-DNS-Prefetch-Control", "on");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}