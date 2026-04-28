/**
 * POST /api/v1/webhooks/heygen
 * Receives HeyGen avatar generation status events.
 *
 * Security: HMAC-SHA256 signature verification using HEYGEN_WEBHOOK_SECRET.
 * HeyGen sends a hex-encoded HMAC-SHA256 of the raw body in x-heygen-signature.
 * Falls back to plain string equality only if HeyGen API docs update signature scheme.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { inngest } from '@/inngest/client';
import logger from '@/lib/logger';
import { createHmac, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';

// ─── Signature Verification ───────────────────────────────────────────────────

function verifyHeyGenSignature(rawBody: string, signature: string, secret: string): boolean {
  // HeyGen sends HMAC-SHA256 hex digest of the raw request body
  const expected = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const sig = signature.trim();

  // Timing-safe comparison — prevent timing oracle attacks
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(
    Buffer.from(sig, 'utf8'),
    Buffer.from(expected, 'utf8'),
  );
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read raw body BEFORE parsing JSON (signature covers the raw bytes)
  const rawBody = await request.text();
  const signature = request.headers.get('x-heygen-signature') ?? '';
  const secret = process.env.HEYGEN_WEBHOOK_SECRET ?? '';

  if (!secret) {
    // No secret configured — reject in production, allow in dev for testing
    if (process.env.NODE_ENV === 'production') {
      logger.error('[heygen webhook] HEYGEN_WEBHOOK_SECRET is not set in production');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    logger.warn('[heygen webhook] HEYGEN_WEBHOOK_SECRET not set — skipping verification (dev only)');
  } else if (!signature) {
    logger.warn('[heygen webhook] Missing x-heygen-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  } else if (!verifyHeyGenSignature(rawBody, signature, secret)) {
    logger.warn('[heygen webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event_type = payload.event_type as string | undefined;
  const data = payload.data as Record<string, unknown> | undefined;

  logger.info('[heygen webhook] Received', { event_type });

  if (!event_type || !data) {
    return NextResponse.json({ error: 'Missing event_type or data' }, { status: 400 });
  }

  try {
    switch (event_type) {
      case 'avatar_video.success': {
        const avatarId = data.avatar_id as string;
        const videoUrl = data.video_url as string;
        const thumbnail = data.thumbnail_url as string | undefined;

        if (!avatarId) {
          logger.warn('[heygen webhook] avatar_video.success missing avatar_id');
          break;
        }

        await supabaseAdmin
          .from('user_avatars')
          .update({
            status: 'ready',
            video_url: videoUrl,
            thumbnail_url: thumbnail ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('heygen_avatar_id', avatarId);

        // Cancel the Inngest polling job — no longer needed
        await inngest.send({
          name: 'avatar/polling.cancel',
          data: { avatarId },
        });

        logger.info('[heygen webhook] Avatar ready', { avatarId });
        break;
      }

      case 'avatar_video.fail': {
        const avatarId = data.avatar_id as string;
        const errorMsg = (data.error as string | undefined) ?? 'Unknown HeyGen error';

        if (!avatarId) {
          logger.warn('[heygen webhook] avatar_video.fail missing avatar_id');
          break;
        }

        await supabaseAdmin
          .from('user_avatars')
          .update({
            status: 'failed',
            error: errorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq('heygen_avatar_id', avatarId);

        await inngest.send({
          name: 'avatar/polling.cancel',
          data: { avatarId },
        });

        logger.warn('[heygen webhook] Avatar generation failed', { avatarId, error: errorMsg });
        break;
      }

      default:
        logger.info('[heygen webhook] Unhandled event type', { event_type });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('[heygen webhook] Handler error', {
      detail: err instanceof Error ? err.message : String(err),
    });
    // Return 200 to prevent HeyGen from retrying indefinitely
    return NextResponse.json({ ok: true, warning: 'Handler error — see server logs' });
  }
}
