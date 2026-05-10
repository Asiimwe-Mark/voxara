import logger from '@/lib/logger';
/**
 * POST /api/stripe/portal
 *
 * Returns a billing management URL for the active payment provider:
 *   - Paddle   → Paddle Customer Portal (self-serve cancel / update card)
 *   - Flutterwave → Voxara internal billing page (no built-in portal)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBillingPortalUrl } from '@/features/billing/services/subscription';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let returnUrl: string;
  try {
    const body = await request.json() as { returnUrl?: string };
    returnUrl  = body.returnUrl ?? `${request.nextUrl.origin}/dashboard/billing`;
  } catch {
    returnUrl = `${request.nextUrl.origin}/dashboard/billing`;
  }

  try {
    const url = await getBillingPortalUrl(user.id, returnUrl);
    return NextResponse.json({ url });
  } catch (err) {
    logger.error('[portal]', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Portal error' },
      { status: 500 }
    );
  }
}
