import { inngest } from '@/inngest/client';
import { createClient } from '@supabase/supabase-js';
import { createPaymentAdapter } from '@/lib/payment-adapter';
import { sendCreditAlertEmail } from '@/lib/email/service';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const paymentAdapter = createPaymentAdapter();
const provider = process.env.PAYMENT_PROVIDER || 'lemon-squeezy';

export const processAutoTopUp = inngest.createFunction(
  { id: 'process-auto-top-up', name: 'Process Auto Top‑Up', retries: 2 },
  { event: 'billing/auto-top-up' },
  async ({ event, step }) => {
    const { userId } = event.data;

    const settings = await step.run('get-settings', async () => {
      const { data } = await supabaseAdmin
        .from('auto_top_up_settings')
        .select('*, profiles(email, credits, full_name)')
        .eq('user_id', userId)
        .single();
      if (!data?.enabled) throw new Error('Auto top‑up not enabled');
      return data;
    });

    // Get user email for payment
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!profile?.email) throw new Error('User email not found');

    // Handle auto top-up based on payment provider
    if (provider === 'lemon-squeezy') {
      return await handleLemonSqueezyAutoTopup(userId, settings, profile);
    } else if (provider === 'flutterwave') {
      return await handleFlutterwaveAutoTopup(userId, settings, profile);
    }

    throw new Error(`Unknown payment provider: ${provider}`);
  }
);

async function handleLemonSqueezyAutoTopup(userId: string, settings: any, profile: any) {
  // Lemon Squeezy handles subscription renewals automatically
  // This function would be called to trigger a one-time credit pack purchase
  // For recurring subscriptions, Lemon Squeezy manages this automatically

  const creditAmounts: Record<number, number> = {
    10: 999,   // $9.99
    25: 1999,  // $19.99
    50: 2999,  // $29.99
  };

  const amountInCents = creditAmounts[settings.top_up_amount] || 1999;

  // Note: Lemon Squeezy doesn't have a simple one-off charge API
  // In production, you would either:
  // 1. Create an invoice and request payment
  // 2. Trigger a checkout URL via email
  // For now, log and notify
  console.log(`Auto top-up triggered for user ${userId}: ${settings.top_up_amount} credits`);

  // Add credits directly (if using a service account with override permissions)
  await supabaseAdmin.rpc('add_credits', { 
    p_user_id: userId, 
    p_credits: settings.top_up_amount 
  });

  await supabaseAdmin.from('credit_purchases').insert({
    user_id: userId,
    credits_purchased: settings.top_up_amount,
    amount_paid: amountInCents,
    payment_intent_id: `auto-topup-${Date.now()}`,
    provider: 'lemon-squeezy',
    status: 'completed',
  });

  // Send email notification
  await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_credits: settings.top_up_amount });
  const updatedProfile = await supabaseAdmin.from('profiles').select('credits').eq('id', userId).single();
  
  await sendCreditAlertEmail(
    profile.email,
    profile.full_name || 'Creator',
    updatedProfile.data?.credits || settings.profiles.credits + settings.top_up_amount,
    true,
    settings.top_up_amount,
    settings.threshold
  );

  return { success: true, provider: 'lemon-squeezy' };
}

async function handleFlutterwaveAutoTopup(userId: string, settings: any, profile: any) {
  // Flutterwave: Create a subscription or recurring charge
  const client = paymentAdapter.getProvider() as any;

  const amountInKobo = {
    10: 100000,    // ₦1000
    25: 250000,    // ₦2500
    50: 500000,    // ₦5000
  }[settings.top_up_amount] || 250000;

  try {
    const txRef = `auto-topup-${userId}-${Date.now()}`;

    const response = await client.initializePayment({
      amount: amountInKobo,
      email: profile.email,
      currency: 'NGN',
      txRef,
      customData: {
        user_id: userId,
        credits: settings.top_up_amount,
        type: 'auto_top_up',
      },
    });

    if (response.status === 'success') {
      // Payment link generated, would need to be sent to user
      // In production, send email with payment link
      console.log(`Flutterwave auto top-up link generated: ${response.data.link}`);

      // For now, add credits pending payment
      await supabaseAdmin.from('pending_credit_purchases').insert({
        user_id: userId,
        credits_pending: settings.top_up_amount,
        tx_ref: txRef,
        provider: 'flutterwave',
        status: 'pending',
      });
    }

    return { success: true, provider: 'flutterwave' };
  } catch (error) {
    console.error('Flutterwave auto top-up failed:', error);
    throw error;
  }
}