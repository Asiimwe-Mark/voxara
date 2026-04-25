import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('auto_top_up_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json(data || { enabled: false, threshold: 5, top_up_amount: 25 });
}

export async function POST(request: NextRequest) {
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { enabled, threshold, top_up_amount } = body;

  const { error } = await supabase
    .from('auto_top_up_settings')
    .upsert({ user_id: user.id, enabled, threshold, top_up_amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}