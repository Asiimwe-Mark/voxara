/**
 * Node.js-only security utilities.
 *
 * This module uses the Node.js 'crypto' module directly (not the Web Crypto API).
 * Import ONLY from:
 *   - App Router API routes with no `export const runtime = 'edge'`
 *   - Inngest functions
 *   - Server-side services
 *
 * NEVER import this from:
 *   - middleware.ts
 *   - Any file marked `export const runtime = 'edge'`
 *   - Client components
 */

import crypto from 'crypto';

/**
 * Verify a HMAC-SHA256 webhook signature.
 * Timing-safe: uses crypto.timingSafeEqual to prevent timing oracle attacks.
 *
 * @param payload   Raw request body (exact bytes the provider signed)
 * @param signature Hex-encoded HMAC-SHA256 from the provider's header
 * @param secret    Your webhook signing secret
 */
export function verifyWebhookSignatureHmac(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    const sig = signature.trim();
    if (sig.length !== expected.length) return false;

    return crypto.timingSafeEqual(
      Buffer.from(sig,      'utf8'),
      Buffer.from(expected, 'utf8'),
    );
  } catch {
    return false;
  }
}

/**
 * Generate a HMAC-SHA256 hex signature for a payload.
 * Used for signing outgoing webhook deliveries.
 */
export function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Generate a cryptographically secure random token (hex-encoded).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
