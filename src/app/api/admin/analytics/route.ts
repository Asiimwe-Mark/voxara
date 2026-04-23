/**
 * GET /api/admin/analytics
 * Get platform analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get timeframe from query
    const timeframe = req.nextUrl.searchParams.get('timeframe') || '7d';
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily signups
    const { data: signups } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    const dailySignups = groupByDate(signups || [], 'created_at');

    // Get videos generated
    const { data: videos } = await supabase
      .from('videos')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    const videosGenerated = groupByDate(videos || [], 'created_at');

    // Get credits used
    const { data: analytics } = await supabase
      .from('analytics')
      .select('created_at, credits_used')
      .gte('created_at', startDate.toISOString());

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

    // Get top features (mock data for now)
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
 * Group items by date
 */
function groupByDate(
  items: any[],
  dateField: string
): Array<{ date: string; count: number }> {
  const grouped: { [key: string]: number } = {};

  items.forEach((item) => {
    const date = item[dateField].split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count: count as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
