/**
 * GET /api/admin/billing
 * Returns billing records for admin review.
 * Reads from the 'billing' DB view (migration 021) which consolidates
 * credit_purchases and payment_sessions into one queryable surface.
 *
 * Query params:
 *   status   – filter by status (optional)
 *   limit    – max records (default 50, max 200)
 *   page     – page number (default 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';
import { isAdmin } from '@/lib/security';
import { z } from 'zod';

interface BillingRecord {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_charge_id: string | null;
  created_at: string;
}

const querySchema = z.object({
  status: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(200).default(50),
  page:   z.coerce.number().int().min(1).default(1),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin gate: env var list OR profiles.role = 'admin'
    if (!(await isAdmin(user.id, supabase as Parameters<typeof isAdmin>[1]))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const parsed = querySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { status, limit, page } = parsed.data;
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabase
      .from('billing')
      .select('id, user_id, user_email, amount, currency, status, payment_method, payment_charge_id, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);

    const { data: records, error, count } = await query;

    if (error) throw error;

    const transformed: BillingRecord[] = (records ?? []).map((r) => ({
      id:                r.id,
      user_id:           r.user_id,
      email:             r.user_email ?? 'Unknown',
      amount:            r.amount,
      currency:          r.currency,
      status:            r.status,
      payment_method:    r.payment_method,
      payment_charge_id: r.payment_charge_id,
      created_at:        r.created_at,
    }));

    return NextResponse.json({
      records: transformed,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (err) {
    captureException(err as Error, { context: 'admin_billing' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
