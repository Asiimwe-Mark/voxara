import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

/**
 * GET /api/billing/history
 *
 * Returns user's billing/transaction history from the billing view.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: transactions, error } = await supabase
      .from('billing')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('[billing-history] Query failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch billing history' }, { status: 500 });
    }

    return NextResponse.json({ transactions: transactions || [] });
  } catch (err) {
    logger.error('[billing-history] Error', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}