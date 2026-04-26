import logger from '@/lib/logger';
/**
 * GET /api/admin/check-access
 * Checks if the current user has admin privileges.
 * Admin status is determined by either:
 *   1. profiles.role = 'admin'  (DB-level, set via migration/Supabase dashboard)
 *   2. ADMIN_USER_IDS env var   (env-level fallback, comma-separated UUIDs)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/security';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check env-var list first (fast, no DB query)
    if (isAdmin(user.id)) {
      return NextResponse.json({ isAdmin: true });
    }

    // Fall back to DB role column
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ isAdmin: profile?.role === 'admin' });
  } catch (error) {
    logger.error('[check-access] Error:'', { detail: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
