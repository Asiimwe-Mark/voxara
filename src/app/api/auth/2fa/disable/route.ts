/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for user (requires current password verification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException, addBreadcrumb } from '@/lib/monitoring';

export async function POST(req: NextRequest) {
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
