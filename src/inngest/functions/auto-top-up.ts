import { env } from '@/lib/env';
import { getAdminClient } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { inngest } from '@/inngest/client';
import { createFunction } from 'inngest';
import { createPaymentAdapter } from '@/lib/payment-adapter';
import { sendCreditAlertEmail } from '@/lib/email/service';


const paymentAdapter = createPaymentAdapter();
const provider = process.env.PAYMENT_PROVIDER ?? 'paddle';

interface TopUpSettings {
  enabled: boolean;
  threshold: number;
  top_up_amount: number;
  profiles?: { email: string; credits: number; full_name?: string | null };
}

interface UserProfile {
  email: string;
  full_name?: string | null;
}

const CREDIT_PRICES: Record<number, number> = {
  10: 999,
  25: 1999,
  50: 2999,
};

const CREDIT_PRICES_NGN: Record<number, number> = {
  10: 100000,
  25: 250000,
  50: 500000,
};

export const processAutoTopUp = createFunction(
  { id: 'process-auto-top-up', name: 'Process Auto‑Top‑Up', retries: 2, triggers: { event: 'billing/auto-top-up' } },
  async ({ event, step }: { event: any; step: any }) => {
    const supabaseAdmin = getAdminClient();
    const { userId } = event.data as { userId: string };

    const settings = await step.run('get-settings', async (): Promise<TopUpSettings> => {
      const { data } = await supabaseAdmin
        .from('auto_top_up_settings')
        .select('*, profiles(email, credits, full_name)')
        .eq('user_id', userId)
        .single();
      if (!data?.enabled) throw new Error('Auto top‑up not enabled for user');
      // FIX: Cast to TopUpSettings with proper handling
      return {
        enabled: data.enabled ?? false,
        threshold: data.threshold ?? 0,
        top_up_amount: data.top_up_amount ?? 0,
      };
    });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!profile?.email) throw new Error('User email not found');
    const typedProfile: UserProfile = { email: profile.email, full_name: profile.full_name };

    if (provider === 'paddle') {
      return handlePaddleAutoTopup(supabaseAdmin, userId, settings, typedProfile);
    }
    if (provider === 'flutterwave') {
      return handleFlutterwaveAutoTopup(supabaseAdmin, userId, settings, typedProfile);
    }

    throw new Error(`Unknown payment provider: ${provider}`);
  }
);

async function handlePaddleAutoTopup(
  supabaseAdmin: ReturnType<typeof getAdminClient>,
  userId: string,
  settings: TopUpSettings,
  profile: UserProfile
): Promise<{ success: boolean; provider: string }> {
  const amountInCents = CREDIT_PRICES[settings.top_up_amount] ?? 1999;

  await supabaseAdmin.rpc('add_credits', {
    p_user_id: userId,
    p_credits:  settings.top_up_amount,
  });

  await supabaseAdmin.from('credit_purchases').insert({
    user_id:           userId,
    credits_purchased: settings.top_up_amount,
    amount_paid:       amountInCents,
    payment_intent_id: `auto-topup-paddle-${Date.now()}`,
    provider:          'paddle',
    status:            'completed',
  });

  const { data: updated } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  await sendCreditAlertEmail(
    profile.email,
    profile.full_name ?? 'Creator',
    updated?.credits ?? settings.top_up_amount,
    true,
    settings.top_up_amount,
    settings.threshold
  );

  return { success: true, provider: 'paddle' };
}

async function handleFlutterwaveAutoTopup(
  supabaseAdmin: ReturnType<typeof getAdminClient>,
  userId: string,
  settings: TopUpSettings,
  profile: UserProfile
): Promise<{ success: boolean; provider: string }> {
  const amount = CREDIT_PRICES_NGN[settings.top_up_amount] ?? 250000;
  const txRef  = `auto-topup-flutterwave-${userId}-${Date.now()}`;

  try {
    const client = paymentAdapter.getProvider();

    const response = await (client as {
      initializePayment: (opts: { amount: number; email: string; currency?: string; txRef: string; customData?: Record<string, unknown> }) => Promise<{ status: string; data: { link: string } }>;
    }).initializePayment({
      amount,
      email:      profile.email,
      currency:   'NGN',
      txRef,
      customData: { user_id: userId, credits: settings.top_up_amount, type: 'auto_top_up' },
    });

    if (response.status === 'success') {
      logger.info(`[auto-topup] Flutterwave link generated for ${userId}: ${response.data.link}`);

      await supabaseAdmin.from('pending_credit_purchases').insert({
        user_id:         userId,
        credits_pending: settings.top_up_amount,
        tx_ref:          txRef,
        provider:        'flutterwave',
        status:          'pending',
      });
    }

    return { success: true, provider: 'flutterwave' };
  } catch (error) {
    logger.error('[auto-topup] Flutterwave failed', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}