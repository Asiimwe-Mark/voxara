/**
 * POST /api/v1/credits
 * Server-side atomic credit operations via Supabase RPC.
 * Used by the useCredits hook to safely deduct/add credits
 * without race conditions from direct client-side DB updates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  action: z.enum(['deduct', 'add']),
  amount: z.number().int().positive().max(10000),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { action, amount } = parsed.data;

  if (action === 'deduct') {
    const { data: success, error } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_credits: amount,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!success) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    return NextResponse.json({ ok: true });
  }

  // action === 'add'
  const { error } = await supabase.rpc('add_credits', {
    p_user_id: user.id,
    p_credits: amount,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
