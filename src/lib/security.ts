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

/**
 * Synchronous HMAC verification using Node.js crypto.
 * Use this ONLY in Node.js runtime routes (not middleware or edge routes).
 * Import crypto lazily to avoid Edge Runtime crashes.
 */
export async function validateWebhookSignatureNode(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const { createHmac, timingSafeEqual } = await import('crypto');
    const expected = createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
    const sig = signature.trim();
    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'));
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

export function isAdmin(userId: string): boolean {
  const ids = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean);
  return ids.includes(userId);
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
