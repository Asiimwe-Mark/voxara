import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const trackSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('view_start'),
    videoId: z.string().uuid(),
    sessionId: z.string().uuid(),
    viewerId: z.string().optional(),
    deviceType: z.string().optional(),
    browser: z.string().optional(),
    country: z.string().optional(),
    referrer: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
  }),
  z.object({
    type: z.literal('view_progress'),
    sessionId: z.string().uuid(),
    progress: z.number().min(0).max(100),
    currentTime: z.number().min(0),
  }),
  z.object({
    type: z.literal('view_complete'),
    sessionId: z.string().uuid(),
    duration: z.number().min(0),
  }),
]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Lazy import tracker to avoid importing supabase-js in edge runtime
  const { trackViewStart, trackViewProgress, trackViewComplete } = await import('@/lib/analytics/tracker');

  try {
    const event = parsed.data;
    if (event.type === 'view_start') {
      await trackViewStart(event.videoId, event.sessionId, {
        viewerId: event.viewerId,
        deviceType: event.deviceType,
        browser: event.browser,
        country: event.country,
        referrer: event.referrer,
        utmSource: event.utmSource,
        utmMedium: event.utmMedium,
        utmCampaign: event.utmCampaign,
      });
    } else if (event.type === 'view_progress') {
      await trackViewProgress(event.sessionId, event.progress, event.currentTime);
    } else if (event.type === 'view_complete') {
      await trackViewComplete(event.sessionId, event.duration);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Track event error:'', { detail: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
