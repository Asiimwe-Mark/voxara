/**
 * POST /api/auth/2fa/setup
 * Initializes 2FA setup for the current user.
 *
 * The TOTP secret is encrypted with AES-256-GCM before being stored in the DB.
 * Backup codes are SHA-256 hashed (correct — they are one-time use tokens).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateTOTPSecret,
  generateBackupCodes,
  generateQRCodeData,
  hashBackupCode,
} from '@/lib/two-factor-auth';
import { encryptTOTPSecret } from '@/lib/totp-encryption';
import { captureException } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  void req;
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate TOTP secret + 10 backup codes
    const secret      = generateTOTPSecret();
    const backupCodes = generateBackupCodes(10);

    // Hash backup codes for storage (one-way — only hashes live in DB)
    const backupCodesHashed = backupCodes.map(hashBackupCode);

    // Encrypt the TOTP secret at rest using AES-256-GCM
    const encryptedSecret = encryptTOTPSecret(secret);

    // QR code data is the plaintext secret — sent to client only, never stored plaintext
    const qrCodeData = generateQRCodeData(user.email!, secret, 'voxara');

    // Store encrypted secret + hashed backup codes as pending (not yet active)
    const { error: storageError } = await supabase
      .from('profiles')
      .update({
        two_fa_pending_secret:       encryptedSecret,
        two_fa_pending_backup_codes: backupCodesHashed,
      })
      .eq('id', user.id);

    if (storageError) {
      captureException(new Error(`Failed to store 2FA setup: ${storageError.message}`));
      return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
    }

    // Return plaintext backup codes for display ONLY — they are not stored as plaintext
    return NextResponse.json({
      success: true,
      qrCodeData,
      backupCodes,
      message: 'Scan the QR code with your authenticator app, then save your backup codes.',
    });
  } catch (error) {
    captureException(error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
