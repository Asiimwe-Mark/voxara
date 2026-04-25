import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { accountId?: string; platform?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { accountId, platform } = body;

  // Support disconnect by either accountId or platform
  let query = supabase.from('social_accounts').delete().eq('user_id', user.id);

  if (accountId) {
    query = query.eq('id', accountId);
  } else if (platform) {
    query = query.eq('platform', platform);
  } else {
    return NextResponse.json({ error: 'accountId or platform is required' }, { status: 400 });
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
