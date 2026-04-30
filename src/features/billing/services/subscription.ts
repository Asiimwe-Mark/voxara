/**
 * Subscription & billing service — Paddle + Flutterwave only.
 * All Stripe and Lemon Squeezy code has been removed.
 */

import { createClient } from '@/lib/supabase/server';
import { createPaymentAdapter } from '@/lib/payment-adapter';

export type PlanType = 'free' | 'pro' | 'agency';

export interface SubscriptionDetails {
  plan: PlanType;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused' | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  credits: number;
  paymentCustomerId: string | null;
  paymentSubscriptionId: string | null;
  provider: string;
}

const PLAN_CREDITS: Record<PlanType, number> = {
  free:   1,
  pro:    30,
  agency: 100,
};

const PLAN_FEATURES: Record<PlanType, string[]> = {
  free: [
    'basic_script_generation',
    'watermarked_export',
    '720p_quality',
    'edge_tts_voices',
  ],
  pro: [
    'basic_script_generation',
    'no_watermark',
    '1080p_quality',
    'elevenlabs_voices',
    'voice_cloning',
    'mux_streaming',
    'priority_support',
  ],
  agency: [
    'basic_script_generation',
    'no_watermark',
    '4k_quality',
    'elevenlabs_voices',
    'voice_cloning',
    'mux_streaming',
    'api_access',
    'team_management',
    'custom_branding',
    'white_label',
    'priority_rendering',
    'priority_support',
  ],
};

/** Get the current user's subscription details from payment_* tables */
export async function getCurrentSubscription(): Promise<SubscriptionDetails | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: customer }, { data: sub }] = await Promise.all([
    supabase.from('profiles').select('credits, plan').eq('id', user.id).single(),
    supabase.from('payment_customers').select('payment_customer_id, provider')
      .eq('user_id', user.id).maybeSingle(),
    supabase.from('payment_subscriptions')
      .select('subscription_id, status, renews_at, provider')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle(),
  ]);

  const plan = (profile?.plan ?? 'free') as PlanType;

  return {
    plan,
    status:                sub?.status ?? null,
    currentPeriodEnd:      sub?.renews_at ? new Date(sub.renews_at) : null,
    cancelAtPeriodEnd:     false,
    credits:               profile?.credits ?? PLAN_CREDITS[plan],
    paymentCustomerId:     customer?.payment_customer_id ?? null,
    paymentSubscriptionId: sub?.subscription_id ?? null,
    provider:              sub?.provider ?? customer?.provider ?? (process.env.PAYMENT_PROVIDER ?? 'paddle'),
  };
}

/** Returns true if the user's current plan includes the named feature */
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const sub = await getCurrentSubscription();
  return PLAN_FEATURES[sub?.plan ?? 'free']?.includes(feature) ?? false;
}

/** Returns the feature list for a given plan — used by pricing UI */
export function getPlanFeatures(plan: PlanType): string[] {
  return PLAN_FEATURES[plan] ?? [];
}

/** Returns credits included per billing cycle for a plan */
export function getPlanCredits(plan: PlanType): number {
  return PLAN_CREDITS[plan];
}

/** Cost in credits for platform actions */
export function getCreditCost(action: string): number {
  const costs: Record<string, number> = {
    generate_video:   1,
    create_avatar:    3,
    clone_voice:      2,
    use_premium_voice: 1,
    export_4k:        2,
  };
  return costs[action] ?? 1;
}

/** Returns true if user has enough credits for the given action */
export async function hasCreditsForAction(action: string): Promise<boolean> {
  const sub = await getCurrentSubscription();
  return (sub?.credits ?? 0) >= getCreditCost(action);
}

/** Persist a new subscription record after webhook confirmation */
export async function upsertPaymentSubscription(params: {
  userId: string;
  subscriptionId: string;
  plan: PlanType;
  provider: string;
  status: string;
  renewsAt?: Date;
}): Promise<void> {
  const supabase = await createClient();

  await supabase.from('payment_subscriptions').upsert(
    {
      user_id:         params.userId,
      subscription_id: params.subscriptionId,
      provider:        params.provider,
      plan:            params.plan,
      status:          params.status,
      renews_at:       params.renewsAt?.toISOString() ?? null,
      updated_at:      new Date().toISOString(),
    },
    { onConflict: 'subscription_id' }
  );

  await supabase
    .from('profiles')
    .update({ plan: params.plan, credits: PLAN_CREDITS[params.plan], updated_at: new Date().toISOString() })
    .eq('id', params.userId);
}

/** Downgrade user to free plan on cancellation */
export async function downgradeToFree(userId: string): Promise<void> {
  const supabase = await createClient();

  await Promise.all([
    supabase.from('payment_subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', userId).in('status', ['active', 'trialing', 'paused']),
    supabase.from('profiles')
      .update({ plan: 'free', credits: PLAN_CREDITS.free, updated_at: new Date().toISOString() })
      .eq('id', userId),
  ]);
}

/** Create a portal / management URL for the active provider */
export async function getBillingPortalUrl(userId: string, returnUrl: string): Promise<string> {
  const provider = process.env.PAYMENT_PROVIDER ?? 'paddle';

  if (provider === 'paddle') {
    // Paddle has a customer portal — construct link from customer ID
    const supabase = await createClient();
    const { data: customer } = await supabase
      .from('payment_customers')
      .select('payment_customer_id')
      .eq('user_id', userId)
      .eq('provider', 'paddle')
      .maybeSingle();

    if (customer?.payment_customer_id) {
      return `https://customer-portal.paddle.com/${customer.payment_customer_id}`;
    }
    return returnUrl;
  }

  // Flutterwave has no built-in portal — redirect to Voxara billing page
  return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;
}
