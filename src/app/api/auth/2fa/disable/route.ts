/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for user (requires current password or TOTP code for re-authentication)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTOTPCode, isValidTOTPFormat } from '@/lib/two-factor-auth';
import { ratelimit } from '@/lib/rate-limit';
import { captureException, addBreadcrumb } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  // Rate limit per IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { success: rateOk } = await ratelimit.limit(`2fa-disable:${ip}`);
  if (!rateOk) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require either password or TOTP code for re-authentication
    const { password, totpCode } = await req.json();

    if (!password && !totpCode) {
      return NextResponse.json(
        { error: 'Re-authentication required. Provide password or totpCode.' },
        { status: 400 }
      );
    }

    // Verify re-authentication
    if (totpCode) {
      if (!isValidTOTPFormat(totpCode)) {
        return NextResponse.json({ error: 'Invalid TOTP code format' }, { status: 400 });
      }
      // Get the user's current 2FA secret to verify
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_fa_enabled, two_fa_secret')
        .eq('id', user.id)
        .single();

      if (!profile?.two_fa_enabled || !profile?.two_fa_secret) {
        return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
      }

      if (!verifyTOTPCode(profile.two_fa_secret, totpCode)) {
        return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 401 });
      }
    } else if (password) {
      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      });
      if (signInError) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Disable 2FA
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        two_fa_enabled: false,
        two_fa_secret: null,
        two_fa_backup_codes: null,
        two_fa_pending_secret: null,
        two_fa_pending_backup_codes: null,
        two_fa_enabled_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      captureException(new Error(`Failed to disable 2FA: ${updateError.message}`));
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    addBreadcrumb('2FA disabled', { userId: user.id }, 'warning');

    return NextResponse.json({
      success: true,
      message: '2FA successfully disabled',
    });
  } catch (error) {
    captureException(error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
