/**
 * POST /api/auth/2fa/setup
 * Initialize 2FA setup for user (rate-limited)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTOTPSecret, generateBackupCodes, generateQRCodeData, hashBackupCode } from '@/lib/two-factor-auth';
import { ratelimit } from '@/lib/rate-limit';
import { captureException } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  // Rate limit per IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { success: rateOk } = await ratelimit.limit(`2fa-setup:${ip}`);
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

    // Generate TOTP secret and backup codes
    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes(10);
    const backupCodesHashed = backupCodes.map(hashBackupCode);

    // Generate QR code data
    const qrCodeData = generateQRCodeData(user.email!, secret, 'voxara');

    // Store temporary 2FA setup (pending verification)
    const { error: storageError } = await supabase
      .from('profiles')
      .update({
        two_fa_pending_secret: secret,
        two_fa_pending_backup_codes: backupCodesHashed,
      })
      .eq('id', user.id);

    if (storageError) {
      captureException(new Error(`Failed to store 2FA setup: ${storageError.message}`));
      return NextResponse.json(
        { error: 'Failed to setup 2FA' },
        { status: 500 }
      );
    }

    // Return setup data (backup codes in plain text for display only)
    return NextResponse.json({
      success: true,
      qrCodeData,
      backupCodes, // Client should show these to user
      message: 'Scan QR code with authenticator app and save backup codes',
    });
  } catch (error) {
    captureException(error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
