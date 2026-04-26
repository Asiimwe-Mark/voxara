/**
 * Enterprise-grade security utilities
 * Implements security best practices and hardening measures
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Verify request origin.
 * Allows server-to-server requests (no Origin header) and configured origins.
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // Server-to-server requests (curl, internal Next.js calls, webhooks) have no Origin header
  if (!origin) return true;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const allowedOrigins: string[] = [
    'https://voxara.app',
    'https://www.voxara.app',
  ];

  if (appUrl) allowedOrigins.push(appUrl);

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
    );
  }

  try {
    return allowedOrigins.some((allowed) => {
      try {
        return origin === allowed || origin === new URL(allowed).origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Hash sensitive data for logging
 */
export function hashForLogging(str: string): string {
  return str.substring(0, 4) + '***' + str.substring(str.length - 4);
}

/**
 * Validate API key format
 */
export function isValidApiKey(key: string): boolean {
  return key.startsWith('fv_') && key.length > 20;
}

/**
 * Validate webhook signature (HMAC-SHA256) using timing-safe comparison
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const normalizedSig = signature.trim();

  if (normalizedSig.length !== computed.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(computed, 'utf8'),
    Buffer.from(normalizedSig, 'utf8')
  );
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate URL is safe (no SSRF risk)
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      ['http:', 'https:'].includes(parsed.protocol) &&
      !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Get client IP address (considering proxies)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return (
    request.headers.get('x-real-ip') ||
    // @ts-expect-error — NextRequest.ip exists at runtime on Vercel
    request.ip ||
    'unknown'
  );
}

/**
 * Rate limit key with scope
 */
export function getRateLimitKey(identifier: string, scope: string): string {
  return `ratelimit:${scope}:${identifier}`;
}

/**
 * Check if user ID is an admin
 */
export function isAdmin(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);
  return adminIds.includes(userId);
}

/**
 * Mask sensitive data in objects for safe logging
 */
export function maskSensitiveData(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization'];
  const masked = Array.isArray(obj)
    ? ([...obj] as unknown[])
    : ({ ...(obj as Record<string, unknown>) } as Record<string, unknown>);

  for (const key in masked as Record<string, unknown>) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      (masked as Record<string, unknown>)[key] = '***REDACTED***';
    } else {
      (masked as Record<string, unknown>)[key] = maskSensitiveData(
        (masked as Record<string, unknown>)[key]
      );
    }
  }

  return masked;
}
