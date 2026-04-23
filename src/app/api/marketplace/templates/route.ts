import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'popular';
  const search = searchParams.get('search') || '';

  let query = supabase
    .from('marketplace_templates')
    .select(`
      id, name, description, category, price, preview_url, downloads, rating, created_at,
      profiles!creator_id(full_name, avatar_url)
    `)
    .eq('status', 'published');

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  if (sort === 'popular') query = query.order('downloads', { ascending: false });
  else if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else if (sort === 'price_low') query = query.order('price', { ascending: true });
  else if (sort === 'price_high') query = query.order('price', { ascending: false });

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const templates = (data ?? []).map((t) => ({
    ...t,
    creator: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles,
  }));

  return NextResponse.json({ templates });
}
