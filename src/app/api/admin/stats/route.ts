/**
 * GET /api/admin/stats
 * Returns overall admin dashboard statistics.
 * Requires BOTH: user in ADMIN_USER_IDS env var AND profiles.role = 'admin'.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';
import { isAdmin } from '@/lib/security';

export async function GET(req: NextRequest) {
  void req;
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Both env-var list AND DB role must pass
    const admin = await isAdmin(user.id, supabase as Parameters<typeof isAdmin>[1]);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', thirtyDaysAgo.toISOString());

    // Total videos
    const { count: totalVideos } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    // Videos this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count: videosThisMonth } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Revenue (credits purchased) last 30 days
    const { data: recentPurchases } = await supabase
      .from('credit_purchases')
      .select('amount_paid')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('status', 'completed');

    const revenueThisMonth = (recentPurchases ?? []).reduce(
      (sum, p) => sum + (p.amount_paid ?? 0),
      0
    );

    return NextResponse.json({
      totalUsers:      totalUsers      ?? 0,
      activeUsers:     activeUsers     ?? 0,
      totalVideos:     totalVideos     ?? 0,
      videosThisMonth: videosThisMonth ?? 0,
      revenueThisMonth,
    });
  } catch (err) {
    captureException(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export { OPTIONS } from '@/lib/api/cors';
