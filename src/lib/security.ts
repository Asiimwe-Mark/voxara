/**
 * Enterprise-grade security utilities — Edge Runtime compatible.
 *
 * Uses the Web Crypto API (globalThis.crypto) which is available in:
 *   - Edge Runtime (Vercel middleware, edge routes)
 *   - Node.js 19+ (native Web Crypto)
 *   - All modern browsers
 *
 * IMPORTANT: Do NOT import the Node.js 'crypto' module here.
 * This file is imported by middleware.ts which runs in the Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Security Headers ─────────────────────────────────────────────────────────

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':    'nosniff',
  'X-Frame-Options':            'DENY',
  'X-XSS-Protection':           '1; mode=block',
  'Referrer-Policy':            'strict-origin-when-cross-origin',
  'Permissions-Policy':         'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security':  'max-age=63072000; includeSubDomains; preload',
};

export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ─── Origin Validation ────────────────────────────────────────────────────────

export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  // Server-to-server / webhook calls have no Origin header — always allow
  if (!origin) return true;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const allowed: string[] = ['https://voxara.app', 'https://www.voxara.app'];
  if (appUrl) allowed.push(appUrl);
  if (process.env.NODE_ENV !== 'production') {
    allowed.push('http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001');
  }

  return allowed.some((a) => {
    try { return origin === a || origin === new URL(a).origin; }
    catch { return false; }
  });
}

// ─── HMAC-SHA256 Webhook Verification (Web Crypto — Edge compatible) ──────────

/**
 * Verify a HMAC-SHA256 webhook signature.
 * Uses the Web Crypto API — compatible with Edge Runtime, Node.js 19+, browsers.
 *
 * @param payload    Raw request body string (must be the exact bytes signed)
 * @param signature  Hex-encoded HMAC-SHA256 from the provider's header
 * @param secret     Your webhook secret
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    // Convert hex signature to Uint8Array
    const sigHex = signature.trim();
    if (sigHex.length % 2 !== 0) return false;
    const sigBytes = new Uint8Array(sigHex.length / 2);
    for (let i = 0; i < sigHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(sigHex.slice(i, i + 2), 16);
    }

    return await globalThis.crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
  } catch {
    return false;
  }
}


// ─── CSRF Token (Web Crypto — Edge compatible) ────────────────────────────────

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── URL Safety ───────────────────────────────────────────────────────────────

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      ['http:', 'https:'].includes(parsed.protocol) &&
      !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)
    );
  } catch { return false; }
}

// ─── Client IP ────────────────────────────────────────────────────────────────

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

/**
 * Check if userId appears in the ADMIN_USER_IDS env var.
 * This is the fast synchronous check — use as the first gate.
 */
export function isAdminByEnv(userId: string): boolean {
  const ids = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean);
  return ids.includes(userId);
}

/**
 * Full admin check requiring BOTH the env-var list AND the DB role to pass.
 * Defence-in-depth: neither source alone is sufficient.
 *
 * @param userId   - auth.uid() of the requesting user
 * @param supabase - server-scoped Supabase client (with cookie context)
 *
 * Returns true only when:
 *   1. userId is in ADMIN_USER_IDS env var, AND
 *   2. profiles.role = 'admin' in the database
 */
export async function isAdmin(
  userId: string,
  supabase: { from: (t: string) => { select: (c: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: Record<string,unknown> | null }> } } } }
): Promise<boolean> {
  // Gate 1 — env var list (fast, no DB round-trip if it fails)
  if (!isAdminByEnv(userId)) return false;

  // Gate 2 — DB role column
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return profile?.['role'] === 'admin';
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function getRateLimitKey(identifier: string, scope: string): string {
  return `ratelimit:${scope}:${identifier}`;
}

export function hashForLogging(str: string): string {
  return str.substring(0, 4) + '***' + str.substring(str.length - 4);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '').substring(0, 10000);
}

export function maskSensitiveData(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sensitive = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization'];
  const copy = Array.isArray(obj) ? [...obj] as unknown[] : { ...(obj as Record<string, unknown>) };
  for (const key in copy as Record<string, unknown>) {
    if (sensitive.some((k) => key.toLowerCase().includes(k))) {
      (copy as Record<string, unknown>)[key] = '***REDACTED***';
    } else {
      (copy as Record<string, unknown>)[key] = maskSensitiveData((copy as Record<string, unknown>)[key]);
    }
  }
  return copy;
}
