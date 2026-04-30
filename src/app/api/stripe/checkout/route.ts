import logger from '@/lib/logger';
/**
 * POST /api/stripe/checkout
 *
 * Legacy route name kept for URL compatibility.
 * Now backed by Paddle (global) or Flutterwave (Africa) — no Stripe.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentAdapter } from '@/lib/payment-adapter';
import type { CheckoutParams } from '@/lib/payment-adapter';

type PlanType = 'free' | 'pro' | 'agency';
type ModeType = 'subscription' | 'payment';

const SUBSCRIPTION_PRICES: Record<PlanType, number> = {
  free:   0,
  pro:    29.00,
  agency: 99.00,
};

const CREDIT_PACK_PRICES: Record<number, number> = {
  10: 9.00,
  25: 19.00,
  50: 29.00,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    planType?: string;
    mode?: string;
    credits?: number;
    successUrl?: string;
    cancelUrl?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const planType = (body.planType ?? 'pro') as PlanType;
  const mode     = (body.mode    ?? 'subscription') as ModeType;
  const credits  = body.credits;

  const amount =
    mode === 'payment' && credits
      ? (CREDIT_PACK_PRICES[credits] ?? 19.00)
      : SUBSCRIPTION_PRICES[planType] ?? 29.00;

  const origin = request.nextUrl.origin;

  const params: CheckoutParams = {
    userId:     user.id,
    email:      user.email!,
    amount,
    credits,
    planType:   planType as CheckoutParams['planType'],
    mode,
    successUrl: body.successUrl ?? `${origin}/dashboard?checkout=success`,
    cancelUrl:  body.cancelUrl  ?? `${origin}/pricing?checkout=cancelled`,
    metadata: {
      created_at: new Date().toISOString(),
    },
  };

  try {
    const adapter  = createPaymentAdapter();
    const session  = await adapter.createCheckout(params);
    const provider = process.env.PAYMENT_PROVIDER ?? 'paddle';

    // Store session for reconciliation (non-fatal if it fails)
    await supabase.from('payment_sessions').insert({
      user_id:    user.id,
      provider,
      session_id: session.id,
      plan_type:  planType,
      credits:    credits ?? null,
      status:     'pending',
      metadata:   session.metadata,
    }).then(({ error }) => {
      if (error) logger.warn('[checkout] Session log failed', { error: error.message });
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error('[checkout] Failed', { detail: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout creation failed' },
      { status: 500 }
    );
  }
}
