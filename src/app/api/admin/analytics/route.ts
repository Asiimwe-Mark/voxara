/**
 * GET /api/admin/analytics
 * Get platform analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';
import { isAdmin } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch User Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    /**
     * 3. Verify Admin Access
     * FIX: Use 'as unknown' to bridge the type gap between SupabaseClient and isAdmin parameters.
     * FIX: Updated the check to use the 'admin' variable instead of the undefined 'adminByEnv'.
     */
    const admin = await isAdmin(user.id, supabase as unknown as Parameters<typeof isAdmin>[1]);
    
    if (!admin && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Handle Timeframe Logic
    const timeframe = req.nextUrl.searchParams.get('timeframe') || '7d';
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    // 5. Fetch Daily Signups
    const { data: signups } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDateISO);

    const dailySignups = groupByDate(signups || [], 'created_at');

    // 6. Fetch Videos Generated
    const { data: videos } = await supabase
      .from('videos')
      .select('created_at')
      .gte('created_at', startDateISO);

    const videosGenerated = groupByDate(videos || [], 'created_at');

    // 7. Fetch and Process Credits Used
    const { data: analytics } = await supabase
      .from('analytics')
      .select('created_at, credits_used')
      .gte('created_at', startDateISO);

    const creditsUsed = (analytics || []).reduce(
      (acc: any[], item: any) => {
        const date = item.created_at.split('T')[0];
        const existing = acc.find((d) => d.date === date);
        if (existing) {
          existing.amount += item.credits_used || 0;
        } else {
          acc.push({ date, amount: item.credits_used || 0 });
        }
        return acc;
      },
      []
    );

    // 8. Top Features (Static/Mock Data)
    const topFeatures = [
      { feature: 'Video Generation', uses: 1250 },
      { feature: 'Script Generation', uses: 890 },
      { feature: 'Voice Cloning', uses: 650 },
      { feature: 'Avatar Creation', uses: 420 },
      { feature: 'Publishing', uses: 380 },
    ];

    return NextResponse.json({
      dailySignups,
      videosGenerated,
      creditsUsed,
      topFeatures,
    });

  } catch (error) {
    captureException(error as Error, { context: 'admin_analytics' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Group items by date helper
 */
function groupByDate(
  items: any[],
  dateField: string
): Array<{ date: string; count: number }> {
  const grouped: { [key: string]: number } = {};

  items.forEach((item) => {
    if (item[dateField]) {
      const date = item[dateField].split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    }
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}