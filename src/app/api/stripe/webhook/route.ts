import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email/service';
import { createPaymentAdapter } from '@/lib/payment-adapter';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const paymentAdapter = createPaymentAdapter();
const provider = process.env.PAYMENT_PROVIDER || 'lemon-squeezy';

export async function POST(request: NextRequest) {
  let body = '';
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const headersList = await headers();
  const signature = provider === 'lemon-squeezy'
    ? headersList.get('x-signature')
    : headersList.get('verif-hash');

  if (!signature) {
    console.error('Missing webhook signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Verify signature based on provider
  if (provider === 'lemon-squeezy') {
    if (!paymentAdapter.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else if (provider === 'flutterwave') {
    if (!paymentAdapter.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  try {
    const event = JSON.parse(body);

    if (provider === 'lemon-squeezy') {
      return await handleLemonSqueezyWebhook(event);
    } else if (provider === 'flutterwave') {
      return await handleFlutterwaveWebhook(event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleLemonSqueezyWebhook(event: any) {
  const { meta, data } = event;
  const eventType = meta.event_name;

  // Extract user_id from custom data
  const userId = data?.custom_data?.user_id || data?.attributes?.custom_data?.user_id;

  if (!userId) {
    console.warn('No user_id in webhook event');
    return NextResponse.json({ received: true });
  }

  switch (eventType) {
    case 'order.created':
    case 'order.completed': {
      const { variant_id, total, attributes } = data;
      const credits = data?.custom_data?.credits || 0;

      if (credits > 0) {
        await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_credits: credits });
        await supabaseAdmin.from('credit_purchases').insert({
          user_id: userId,
          credits_purchased: credits,
          amount_paid: total || 0,
          payment_intent_id: data.id,
          provider: 'lemon-squeezy',
          status: 'completed',
        });

        // Send success email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name, credits')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          await sendPaymentSuccessEmail(
            profile.email,
            profile.full_name || 'Creator',
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
      const { id, attributes } = data;
      const planType = data?.custom_data?.plan_type || 'pro';

      // Determine plan and credits from custom data
      const planMap: Record<string, { plan: string; credits: number }> = {
        'pro': { plan: 'pro', credits: 30 },
        'agency': { plan: 'agency', credits: 100 },
        'free': { plan: 'free', credits: 3 },
      };

      const { plan, credits } = planMap[planType] || { plan: 'pro', credits: 30 };

      // Upsert subscription
      await supabaseAdmin.from('payment_subscriptions').upsert({
        user_id: userId,
        subscription_id: id,
        provider: 'lemon-squeezy',
        plan,
        status: attributes.status,
        renews_at: attributes.renews_at,
        metadata: data?.custom_data || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'subscription_id' });

      // Update user profile
      await supabaseAdmin.from('profiles').update({ plan, credits }).eq('id', userId);

      // Send welcome email
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.email && eventType === 'subscription.created') {
        const prices: Record<string, string> = {
          'pro': '$19.99',
          'agency': '$49.99',
          'free': 'Free',
        };
        await sendPaymentSuccessEmail(
          profile.email,
          profile.full_name || 'Creator',
          plan,
          prices[plan],
          credits,
          new Date().toLocaleDateString()
        );
      }
      break;
    }

    case 'subscription.cancelled': {
      const { id } = data;
      const { data: sub } = await supabaseAdmin
        .from('payment_subscriptions')
        .select('user_id')
        .eq('subscription_id', id)
        .maybeSingle();

      if (sub) {
        await supabaseAdmin.from('profiles').update({ plan: 'free', credits: 3 }).eq('id', sub.user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleFlutterwaveWebhook(event: any) {
  // Flutterwave webhook structure
  const { data, event: eventType, status } = event;

  if (status !== 'success') {
    console.warn('Flutterwave webhook with non-success status:', status);
    return NextResponse.json({ received: true });
  }

  const userId = data?.meta?.userId || data?.meta?.user_id;
  const txRef = data?.tx_ref;

  if (!userId) {
    console.warn('No user_id in Flutterwave webhook');
    return NextResponse.json({ received: true });
  }

  switch (eventType) {
    case 'charge.completed': {
      const { amount, currency, id } = data;
      const customData = data?.meta || {};
      const credits = customData.credits || 0;

      if (credits > 0) {
        await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_credits: credits });
        await supabaseAdmin.from('credit_purchases').insert({
          user_id: userId,
          credits_purchased: credits,
          amount_paid: amount,
          payment_intent_id: id,
          provider: 'flutterwave',
          status: 'completed',
        });

        // Send success email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name, credits')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          await sendPaymentSuccessEmail(
            profile.email,
            profile.full_name || 'Creator',
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
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.email) {
        await sendPaymentFailedEmail(
          profile.email,
          profile.full_name || 'Creator',
          'Your payment could not be processed. Please try again.'
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}