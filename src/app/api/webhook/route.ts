import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email/service';
import { createPaymentAdapter } from '@/lib/payment-adapter';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaddleEvent {
  meta: {
    event_name: string;
    custom_data?: Record<string, string | number>;
  };
  data: {
    id: string;
    variant_id?: string;
    total?: number;
    attributes?: {
      status?: string;
      renews_at?: string;
      [key: string]: unknown;
    };
    custom_data?: Record<string, string | number>;
  };
}

interface FlutterwaveEvent {
  event: string;
  status: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    tx_ref?: string;
    customer: { email: string };
    meta?: Record<string, string | number>;
  };
}

interface AutoTopUpProfile {
  email: string;
  full_name?: string | null;
  credits?: number;
}

interface AutoTopUpSettings {
  top_up_amount: number;
  threshold: number;
  enabled: boolean;
  profiles?: { email: string; credits: number; full_name?: string };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

const paymentAdapter = createPaymentAdapter();
const provider = process.env.PAYMENT_PROVIDER ?? 'paddle';

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body = '';
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const headersList = await headers();
  // Paddle sends: Paddle-Signature: ts=<unix>;h1=<hmac_sha256_hex>
  // Flutterwave sends: verif-hash: <plain_hmac_hex>
  const rawSignature =
    provider === 'paddle'
      ? headersList.get('paddle-signature')
      : headersList.get('verif-hash');

  // Parse Paddle's ts=...;h1=... format to extract just the hex digest
  let signature = rawSignature ?? '';
  if (provider === 'paddle' && rawSignature) {
    const h1Match = rawSignature.match(/h1=([a-f0-9]+)/i);
    signature = h1Match ? h1Match[1] : rawSignature;
  }

  if (!rawSignature) {
    logger.error('[webhook] Missing signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!paymentAdapter.verifyWebhookSignature(body, signature)) {
    logger.error('[webhook] Invalid signature for provider', { detail: provider });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(body) as PaddleEvent | FlutterwaveEvent;

    if (provider === 'paddle') {
      return await handlePaddleWebhook(event as PaddleEvent);
    }
    if (provider === 'flutterwave') {
      return await handleFlutterwaveWebhook(event as FlutterwaveEvent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('[webhook] Processing failed', { detail: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── Paddle handler ──────────────────────────────────────────────────────────

const PLAN_MAP: Record<string, { plan: string; credits: number }> = {
  pro:    { plan: 'pro',    credits: 30  },
  agency: { plan: 'agency', credits: 100 },
  free:   { plan: 'free',   credits: 1   },
};

const PLAN_PRICES: Record<string, string> = {
  pro:    '$29.00',
  agency: '$99.00',
  free:   'Free',
};

async function handlePaddleWebhook(event: PaddleEvent): Promise<NextResponse> {
  const { meta, data } = event;
  const eventType = meta.event_name;
  const userId = String(
    data?.custom_data?.user_id ?? meta?.custom_data?.user_id ?? ''
  );

  if (!userId) {
    logger.warn('[paddle-webhook] No user_id in event', { detail: eventType });
    return NextResponse.json({ received: true });
  }

  const adminClient = supabaseAdmin;

  switch (eventType) {
    case 'order.created':
    case 'order.completed': {
      const credits = Number(data?.custom_data?.credits ?? 0);
      const purchaseType = String(data?.custom_data?.type ?? '');
      const total = data.total ?? 0;

      if (purchaseType === 'template_purchase') {
        const templateId = String(data?.custom_data?.template_id ?? '');
        if (templateId) {
          await adminClient.from('template_purchases').upsert(
            {
              buyer_id: userId,
              template_id: templateId,
              amount_paid: total,
            },
            { onConflict: ['buyer_id', 'template_id'] }
          );
          await adminClient.rpc('increment_template_downloads', { template_id: templateId });
        }
      } else if (credits > 0) {
        await adminClient.rpc('add_credits', { p_user_id: userId, p_credits: credits });
        await adminClient.from('credit_purchases').insert({
          user_id: userId,
          credits_purchased: credits,
          amount_paid: total,
          payment_intent_id: data.id,
          provider: 'paddle',
          status: 'completed',
        });

        const { data: profile } = await adminClient
          .from('profiles')
          .select('email, full_name, credits')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          await sendPaymentSuccessEmail(
            profile.email,
            profile.full_name ?? 'Creator',
            'credit_pack',
            `$${(total / 100).toFixed(2)}`,
            credits,
            new Date().toLocaleDateString()
          );
        }
      }
      break;
    }

    case 'subscription.created':
    case 'subscription.updated': {
      const planType = String(data?.custom_data?.plan_type ?? 'pro');
      const { plan, credits } = PLAN_MAP[planType] ?? PLAN_MAP.pro;
      const attrs = data.attributes ?? {};

      await adminClient.from('payment_subscriptions').upsert(
        {
          user_id:       userId,
          subscription_id: data.id,
          provider:      'paddle',
          plan,
          status:        attrs.status ?? 'active',
          renews_at:     attrs.renews_at ?? null,
          metadata:      data?.custom_data ?? {},
          updated_at:    new Date().toISOString(),
        },
        { onConflict: 'subscription_id' }
      );

      await adminClient.from('profiles').update({ plan, credits }).eq('id', userId);

      if (eventType === 'subscription.created') {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          await sendPaymentSuccessEmail(
            profile.email,
            profile.full_name ?? 'Creator',
            plan,
            PLAN_PRICES[plan] ?? '$29.00',
            credits,
            new Date().toLocaleDateString()
          );
        }
      }
      break;
    }

    case 'subscription.cancelled': {
      const { data: sub } = await adminClient
        .from('payment_subscriptions')
        .select('user_id')
        .eq('subscription_id', data.id)
        .maybeSingle();

      if (sub) {
        await adminClient
          .from('profiles')
          .update({ plan: 'free', credits: 1 })
          .eq('id', sub.user_id);
      }
      break;
    }

    default:
      logger.info('[paddle-webhook] Unhandled event', { detail: eventType });
  }

  return NextResponse.json({ received: true });
}

// ─── Flutterwave handler ──────────────────────────────────────────────────────

async function handleFlutterwaveWebhook(event: FlutterwaveEvent): Promise<NextResponse> {
  const { data, event: eventType, status } = event;

  if (status !== 'success') {
    logger.warn('[fw-webhook] Non-success status', { detail: status });
    return NextResponse.json({ received: true });
  }

  const userId = String(data?.meta?.userId ?? data?.meta?.user_id ?? '');

  if (!userId) {
    logger.warn('[fw-webhook] No user_id in event', { detail: eventType });
    return NextResponse.json({ received: true });
  }

  const adminClient = supabaseAdmin;

  switch (eventType) {
    case 'charge.completed': {
      const { amount, currency, id } = data;
      const purchaseType = String(data?.meta?.type ?? '');
      const credits = Number(data?.meta?.credits ?? 0);

      if (purchaseType === 'template_purchase') {
        const templateId = String(data?.meta?.template_id ?? '');
        if (templateId) {
          await adminClient.from('template_purchases').upsert(
            {
              buyer_id: userId,
              template_id: templateId,
              amount_paid: amount,
            },
            { onConflict: ['buyer_id', 'template_id'] }
          );
          await adminClient.rpc('increment_template_downloads', { template_id: templateId });
        }
      } else if (credits > 0) {
        await adminClient.rpc('add_credits', { p_user_id: userId, p_credits: credits });
        await adminClient.from('credit_purchases').insert({
          user_id:          userId,
          credits_purchased: credits,
          amount_paid:      amount,
          payment_intent_id: id,
          provider:         'flutterwave',
          status:           'completed',
        });

        const { data: profile } = await adminClient
          .from('profiles')
          .select('email, full_name, credits')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          await sendPaymentSuccessEmail(
            profile.email,
            profile.full_name ?? 'Creator',
            'credit_pack',
            `${currency} ${(amount / 100).toFixed(2)}`,
            credits,
            new Date().toLocaleDateString()
          );
        }
      }
      break;
    }

    case 'charge.failed': {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.email) {
        await sendPaymentFailedEmail(
          profile.email,
          profile.full_name ?? 'Creator',
          'Your payment could not be processed. Please try again.'
        );
      }
      break;
    }

    default:
      logger.info('[fw-webhook] Unhandled event', { detail: eventType });
  }

  return NextResponse.json({ received: true });
}

// ─── Exported helpers used by auto-top-up inngest function ───────────────────

export type { AutoTopUpProfile, AutoTopUpSettings };