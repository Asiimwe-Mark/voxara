import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/service';
import logger from '@/lib/logger';

/**
 * POST /api/emails/welcome
 *
 * Sends a welcome email to the user.
 * Called from auth callback for new users.
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { email: string; username: string };

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Only allow users to send welcome email to their own email
    if (body.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot send to different email' }, { status: 403 });
    }

    const username = body.username || user.email?.split('@')[0] || 'there';

    await sendWelcomeEmail(body.email, username);

    logger.info('[welcome-email] Sent welcome email', { email: body.email });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('[welcome-email] Failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}