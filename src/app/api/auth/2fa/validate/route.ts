/**
 * POST /api/auth/2fa/validate
 * Validate 2FA code during login
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTOTPCode, verifyBackupCode, useBackupCode, isValidTOTPFormat, isValidBackupCodeFormat } from '@/lib/two-factor-auth';
import { captureException, addBreadcrumb } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing userId or code' },
        { status: 400 }
      );
    }

     const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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

    const codeNormalized = code.replace(/\s+/g, '').toUpperCase();
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
