/**
 * GET /api/admin/stats
 * Get overall admin dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';
import { isAdmin } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access — env var list OR profiles.role
    if (!isAdmin(user.id)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', thirtyDaysAgo.toISOString());

    // Get total videos
    const { count: totalVideos } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    // Get total revenue from completed payments
    const { data: revenueData } = await supabase
      .from('billing')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

    // Get monthly recurring revenue
    const { data: activeSubscriptions } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan')
      .eq('subscription_status', 'active');

    const mrrMap = {
      free: 0,
      pro: 29,
      agency: 99,
    };

    const monthlyRecurringRevenue = activeSubscriptions?.reduce((sum, sub) => {
      const planKey = (sub.subscription_plan || 'free') as keyof typeof mrrMap;
      return sum + (mrrMap[planKey] || 0);
    }, 0) || 0;

    // Count active subscriptions
    const activeSubCount = activeSubscriptions?.length || 0;

    // Get failed payments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: failedPayments } = await supabase
      .from('billing')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', sevenDaysAgo.toISOString());

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalVideos: totalVideos || 0,
      totalRevenue: Math.round(totalRevenue),
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
      activeSubscriptions: activeSubCount,
      failedPayments: failedPayments || 0,
      systemHealth: 'healthy',
    });
  } catch (error) {
    captureException(error as Error, { context: 'admin_stats' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
