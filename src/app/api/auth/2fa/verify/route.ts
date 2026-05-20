/**
 * POST /api/auth/2fa/verify
 * Verify and enable 2FA for user (rate-limited)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTOTPCode, isValidTOTPFormat } from '@/lib/two-factor-auth';
import { ratelimit } from '@/lib/rate-limit';
import { captureException, addBreadcrumb } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  // Rate limit per IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { success: rateOk } = await ratelimit.limit(`2fa-verify:${ip}`);
  if (!rateOk) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const { code } = await req.json();

    if (!code || !isValidTOTPFormat(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Expected 6 digits.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending 2FA setup
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('two_fa_pending_secret, two_fa_pending_backup_codes')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.two_fa_pending_secret) {
      return NextResponse.json(
        { error: '2FA setup not found or already verified' },
        { status: 400 }
      );
    }

    // Verify TOTP code
    if (!verifyTOTPCode(profile.two_fa_pending_secret, code)) {
      addBreadcrumb('2FA verification failed', { userId: user.id }, 'warning');
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        two_fa_enabled: true,
        two_fa_secret: profile.two_fa_pending_secret,
        two_fa_backup_codes: profile.two_fa_pending_backup_codes,
        two_fa_pending_secret: null,
        two_fa_pending_backup_codes: null,
        two_fa_enabled_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      captureException(new Error(`Failed to enable 2FA: ${updateError.message}`));
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    addBreadcrumb('2FA enabled', { userId: user.id }, 'info');

    return NextResponse.json({
      success: true,
      message: '2FA successfully enabled',
    });
  } catch (error) {
    captureException(error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
