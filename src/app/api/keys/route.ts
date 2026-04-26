import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateApiKey } from '@/lib/api-keys';

const MAX_KEYS_PER_USER = 10;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, preview, status, created_at, last_used_at, expires_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data ?? [] });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Enforce per-user limit
  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  if ((count ?? 0) >= MAX_KEYS_PER_USER) {
    return NextResponse.json(
      { error: `You may not have more than ${MAX_KEYS_PER_USER} active API keys` },
      { status: 400 }
    );
  }

  const { key, hash, preview } = generateApiKey();

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name: `Key ${new Date().toLocaleDateString()}`,
      key_hash: hash,
      preview,
      status: 'active',
    })
    .select('id, name, preview, status, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return the raw key ONCE — it will not be retrievable again
  return NextResponse.json({ key: data, rawKey: key }, { status: 201 });
}
