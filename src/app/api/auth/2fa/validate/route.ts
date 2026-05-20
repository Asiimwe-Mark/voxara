/**
 * POST /api/auth/2fa/validate
 * Validate 2FA code during login.
 *
 * Security: Accepts a signed challengeToken (issued after password verification)
 * instead of a raw userId. This prevents attackers from submitting arbitrary
 * userIds to brute-force TOTP codes. Rate-limited to 5 attempts per 15 minutes
 * per IP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  verifyTOTPCode,
  verifyBackupCode,
  useBackupCode,
  isValidTOTPFormat,
  isValidBackupCodeFormat,
  verifyChallengeToken,
} from '@/lib/two-factor-auth';
import { ratelimit } from '@/lib/rate-limit';
import { captureException, addBreadcrumb } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  // ── Rate limit per IP ──
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { success: rateOk } = await ratelimit.limit(`2fa-validate:${ip}`);
  if (!rateOk) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const { challengeToken, code } = await req.json();

    if (!challengeToken || !code) {
      return NextResponse.json(
        { error: 'Missing challengeToken or code' },
        { status: 400 }
      );
    }

    // ── Verify the signed challenge token ──
    const userId = verifyChallengeToken(challengeToken);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge token. Please sign in again.' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get user's 2FA settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('two_fa_enabled, two_fa_secret, two_fa_backup_codes')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.two_fa_enabled) {
      return NextResponse.json(
        { error: '2FA not enabled for this user' },
        { status: 400 }
      );
    }

    let isValid = false;
    let isBackupCode = false;

    // Check if it's a TOTP code
    if (isValidTOTPFormat(code)) {
      isValid = verifyTOTPCode(profile.two_fa_secret, code);
    }
    // Check if it's a backup code
    else if (isValidBackupCodeFormat(code)) {
      isBackupCode = true;
      isValid = verifyBackupCode(profile.two_fa_backup_codes || [], code);

      // If valid backup code, remove it from list
      if (isValid) {
        const remainingCodes = useBackupCode(profile.two_fa_backup_codes || [], code);
        await supabase
          .from('profiles')
          .update({ two_fa_backup_codes: remainingCodes })
          .eq('id', userId);
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    if (!isValid) {
      addBreadcrumb('2FA validation failed', { userId, isBackupCode }, 'warning');
      return NextResponse.json(
        { error: 'Invalid 2FA code' },
        { status: 401 }
      );
    }

    addBreadcrumb('2FA validation successful', { userId, isBackupCode }, 'info');

    return NextResponse.json({
      success: true,
      message: '2FA validation successful',
      isBackupCode,
    });
  } catch (error) {
    captureException(error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
