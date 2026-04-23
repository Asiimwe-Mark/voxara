/**
 * Enterprise-grade security utilities
 * Implements security best practices and hardening measures
 */

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
 * Verify request origin
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin) return true; // Non-browser requests
  if (!host) return false;

  const allowedOrigins = [
    'https://voxara.app',
    'https://www.voxara.app',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  return allowedOrigins.some((allowed) => origin === allowed || origin === new URL(allowed).origin);
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
 * Validate webhook signature (HMAC-SHA256)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const normalizedSig = signature.trim();
  if (normalizedSig.length !== computed.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(normalizedSig, 'utf8'));
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sanitize SQL to prevent injection (basic protection)
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/"/g, '""') // Escape double quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .substring(0, 5000); // Limit length
}

/**
 * Validate URL is safe
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      ['http:', 'https:'].includes(parsed.protocol) &&
      !['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)
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
  return request.headers.get('x-real-ip') || request.ip || 'unknown';
}

/**
 * Rate limit key with exponential backoff
 */
export function getRateLimitKey(identifier: string, scope: string): string {
  return `ratelimit:${scope}:${identifier}`;
}

/**
 * Check if user is admin (example)
 */
export function isAdmin(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',');
  return adminIds.includes(userId);
}

/**
 * Mask sensitive data in logs
 */
export function maskSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'stripe_key', 'supabase_key'];
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in masked) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}
