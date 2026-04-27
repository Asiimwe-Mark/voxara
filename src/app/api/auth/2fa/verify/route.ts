/**
 * POST /api/auth/2fa/verify
 * Verifies the TOTP code and enables 2FA for the user.
 * The pending secret is stored encrypted — decrypted here before verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTOTPCode, isValidTOTPFormat } from '@/lib/two-factor-auth';
import { decryptTOTPSecret } from '@/lib/totp-encryption';
import { captureException, addBreadcrumb } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || !isValidTOTPFormat(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Expected 6 digits.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Decrypt the stored secret before TOTP comparison
    const plaintextSecret = decryptTOTPSecret(profile.two_fa_pending_secret);

    if (!verifyTOTPCode(plaintextSecret, code)) {
      addBreadcrumb('2FA verification failed', { userId: user.id }, 'warning');
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
    }

    // Enable 2FA — store the encrypted secret permanently
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        two_fa_enabled:              true,
        two_fa_secret:               profile.two_fa_pending_secret, // stays encrypted
        two_fa_backup_codes:         profile.two_fa_pending_backup_codes,
        two_fa_pending_secret:       null,
        two_fa_pending_backup_codes: null,
        two_fa_enabled_at:           new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      captureException(new Error(`Failed to enable 2FA: ${updateError.message}`));
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
    }

    addBreadcrumb('2FA enabled', { userId: user.id }, 'info');

    return NextResponse.json({ success: true, message: '2FA successfully enabled' });
  } catch (error) {
    captureException(error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
