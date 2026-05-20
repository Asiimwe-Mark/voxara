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

// ─── OAuth State Signing (Web Crypto — Edge compatible) ──────────────────────

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getOAuthStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Missing OAUTH_STATE_SECRET or SUPABASE_SERVICE_ROLE_KEY');
  return secret;
}

/**
 * Sign an OAuth state payload with HMAC-SHA256.
 * Returns a base64url-encoded string: `body.signature`
 */
export async function signOAuthState(userId: string): Promise<string> {
  const payload = JSON.stringify({ uid: userId, iat: Date.now() });
  const body = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw', enc.encode(getOAuthStateSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sigBuf = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(body));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${body}.${sig}`;
}

/**
 * Verify a signed OAuth state and return the userId.
 * Returns null if invalid or expired.
 */
export async function verifyOAuthState(token: string): Promise<string | null> {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw', enc.encode(getOAuthStateSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
  );
  // Decode base64url signature to Uint8Array
  const sigPadded = sig.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (sig.length % 4)) % 4);
  const sigBytes = Uint8Array.from(atob(sigPadded), c => c.charCodeAt(0));
  const valid = await globalThis.crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(body));
  if (!valid) return null;

  try {
    const bodyPadded = body.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (body.length % 4)) % 4);
    const payload = JSON.parse(atob(bodyPadded));
    if (!payload.uid || typeof payload.iat !== 'number') return null;
    if (Date.now() - payload.iat > OAUTH_STATE_TTL_MS) return null;
    return payload.uid as string;
  } catch {
    return null;
  }
}
