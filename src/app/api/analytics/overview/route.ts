import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: metrics } = await supabase
    .from('video_metrics')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .order('date', { ascending: true });

  const totalViews = metrics?.reduce((sum, m) => sum + (m.views || 0), 0) || 0;
  const totalWatchTime = metrics?.reduce((sum, m) => sum + (m.watch_time_seconds || 0), 0) || 0;
  const avgCTR = metrics?.length ? metrics.reduce((sum, m) => sum + (m.ctr || 0), 0) / metrics.length : 0;
  const avgRetention = metrics?.length ? metrics.reduce((sum, m) => sum + (m.average_view_percentage || 0), 0) / metrics.length : 0;

  const dailyData = metrics?.reduce((acc: Record<string, { date: string; views: number; watchTime: number; ctr: number; count: number }>, m) => {
    const date = m.date;
    if (!acc[date]) acc[date] = { date, views: 0, watchTime: 0, ctr: 0, count: 0 };
    acc[date].views += m.views || 0;
    acc[date].watchTime += m.watch_time_seconds || 0;
    acc[date].ctr += m.ctr || 0;
    acc[date].count++;
    return acc;
  }, {}) || {};

  const chartData = Object.values(dailyData).map((d) => ({
    ...d,
    ctr: d.count > 0 ? d.ctr / d.count : 0,
  }));

  const { data: topVideos } = await supabase
    .from('video_metrics')
    .select('video_id, videos(title), views, ctr, average_view_percentage')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .order('views', { ascending: false })
    .limit(5);

  return NextResponse.json({
    overview: { totalViews, totalWatchTime, avgCTR, avgRetention },
    dailyData: chartData,
    topVideos: topVideos || [],
  });
}