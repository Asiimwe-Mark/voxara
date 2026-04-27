/**
 * GET /api/admin/check-access
 * Returns { isAdmin: boolean } for the current session.
 * Used by the admin layout to decide whether to show the admin UI.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/security';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const admin = await isAdmin(user.id, supabase as Parameters<typeof isAdmin>[1]);
    return NextResponse.json({ isAdmin: admin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

export { OPTIONS } from '@/lib/api/cors';
