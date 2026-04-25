/**
 * GET /api/admin/billing
 * Get billing records with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';

export async function GET(req: NextRequest) {
  try {
     const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const limit = 50;

    // Build query
    let query = supabase
      .from('billing')
      .select(
        'id, user_id, amount, currency, status, payment_method, stripe_charge_id, created_at, profiles(email)'
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data: records, error } = await query;

    if (error) {
      throw error;
    }

    // Transform records to include email
    const transformedRecords = (records || []).map((record: any) => ({
      id: record.id,
      user_id: record.user_id,
      email: record.profiles?.email || 'Unknown',
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      payment_method: record.payment_method,
      stripe_charge_id: record.stripe_charge_id,
      created_at: record.created_at,
    }));

    return NextResponse.json({
      records: transformedRecords,
    });
  } catch (error) {
    captureException(error as Error, { context: 'admin_billing' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
