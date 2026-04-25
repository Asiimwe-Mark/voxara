import { createClient } from "@/lib/supabase/server";

export type PlanType = "free" | "pro" | "agency";

export interface SubscriptionDetails {
  plan: PlanType;
  status: "active" | "canceled" | "past_due" | "trialing" | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  credits: number;
  paymentCustomerId: string | null;
  paymentSubscriptionId: string | null;
  provider: string;
}

/**
 * Get the current user's subscription details
 */
export async function getCurrentSubscription(): Promise<SubscriptionDetails | null> {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get profile with credits and plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single();

  // Get payment customer info
  const { data: paymentCustomer } = await supabase
    .from("payment_customers")
    .select("payment_customer_id, provider")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get payment subscription
  const { data: subscription } = await supabase
    .from("payment_subscriptions")
    .select("subscription_id, status, renews_at, provider")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    plan: (profile?.plan as PlanType) || "free",
    status: subscription?.status || null,
    currentPeriodEnd: subscription?.renews_at
      ? new Date(subscription.renews_at)
      : null,
    cancelAtPeriodEnd: false,
    credits: profile?.credits ?? 3,
    paymentCustomerId: paymentCustomer?.payment_customer_id || null,
    paymentSubscriptionId: subscription?.subscription_id || null,
    provider: subscription?.provider || paymentCustomer?.provider || process.env.PAYMENT_PROVIDER || 'lemon-squeezy',
  };
}

/**
 * Check if the current user has access to a specific feature based on their plan
 */
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const subscription = await getCurrentSubscription();
  if (!subscription) return false;

  const planFeatures: Record<PlanType, string[]> = {
    free: [
      "basic_script_generation",
      "watermarked_export",
      "720p_quality",
    ],
    pro: [
      "basic_script_generation",
      "no_watermark",
      "1080p_quality",
      "premium_voices",
      "voice_cloning",
      "priority_support",
    ],
    agency: [
      "basic_script_generation",
      "no_watermark",
      "4k_quality",
      "premium_voices",
      "voice_cloning",
      "api_access",
      "team_management",
      "priority_support",
      "custom_branding",
    ],
  };

  return planFeatures[subscription.plan]?.includes(feature) ?? false;
}

/**
 * Get or create a payment customer
 */
export async function getOrCreatePaymentCustomer(userId: string) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const provider = process.env.PAYMENT_PROVIDER || 'lemon-squeezy';

  // Check if payment customer exists
  const { data: existing } = await supabase
    .from("payment_customers")
    .select("payment_customer_id")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  if (existing) {
    return existing.payment_customer_id;
  }

  // Get user email
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);
  if (!user?.email) throw new Error('User email not found');

  // For new customers, they'll be created automatically during checkout
  // Just return null to signal that checkout needs to be initiated
  return null;
}

/**
 * Update user's plan and credits after successful payment
 */
export async function updateUserPlan(
  userId: string,
  plan: PlanType,
  credits: number
) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;

  return supabase
    .from("profiles")
    .update({
      plan,
      credits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/**
 * Add payment subscription record
 */
export async function addPaymentSubscription(
  userId: string,
  subscriptionId: string,
  plan: PlanType,
  provider: string,
  status: string,
  renewsAt?: Date
) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;

  return supabase.from("payment_subscriptions").insert({
    user_id: userId,
    subscription_id: subscriptionId,
    provider,
    plan,
    status,
    renews_at: renewsAt?.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

/**
 * Cancel a user's subscription
 */
export async function cancelSubscription(userId: string) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;

  // Update subscription status
  await supabase
    .from("payment_subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Downgrade to free plan
  await updateUserPlan(userId, "free", 3);
}
    agency: [
      "basic_script_generation",
      "no_watermark",
      "4k_quality",
      "premium_voices",
      "voice_cloning",
      "custom_avatars",
      "team_workspaces",
      "api_access",
      "white_label",
      "priority_rendering",
      "priority_support",
    ],
  };

  return planFeatures[subscription.plan]?.includes(feature) || false;
}

/**
 * Get the credit cost for a specific action
 */
export function getCreditCost(action: string): number {
  const costs: Record<string, number> = {
    generate_video: 1,
    create_avatar: 3,
    clone_voice: 2,
    use_premium_voice: 1,
    export_4k: 2,
  };
  return costs[action] || 1;
}

/**
 * Check if user has sufficient credits for an action
 */
export async function hasCreditsForAction(action: string): Promise<boolean> {
  const subscription = await getCurrentSubscription();
  if (!subscription) return false;

  const required = getCreditCost(action);
  return subscription.credits >= required;
}

/**
 * Get the Stripe price ID for a given plan and interval
 */
export function getPriceId(plan: Exclude<PlanType, "free">, interval: "month" | "year"): string {
  const priceMap: Record<string, Record<string, string>> = {
    pro: {
      month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      year: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    },
    agency: {
      month: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!,
      year: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID!,
    },
  };
  return priceMap[plan]?.[interval] || "";
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  plan: Exclude<PlanType, "free">,
  interval: "month" | "year",
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const priceId = getPriceId(plan, interval);
  if (!priceId) throw new Error("Invalid plan or interval");

  // Get or create Stripe customer
  let { data: stripeCustomer } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = stripeCustomer?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("stripe_customers").insert({
      user_id: user.id,
      stripe_customer_id: customerId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    automatic_tax: { enabled: true },
    metadata: { user_id: user.id, plan, interval },
  });

  return session.url!;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(returnUrl: string): Promise<string> {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: stripeCustomer } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!stripeCustomer) throw new Error("No Stripe customer found");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomer.stripe_customer_id,
    return_url: returnUrl,
    configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
  });

  return portalSession.url;
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (!subscription?.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (!subscription?.stripeSubscriptionId) {
    throw new Error("No subscription found");
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Get the features available for a given plan
 */
export function getPlanFeatures(plan: PlanType): string[] {
  const features: Record<PlanType, string[]> = {
    free: [
      "3 videos per month",
      "720p quality",
      "Watermark included",
      "Basic AI voices",
      "Community support",
    ],
    pro: [
      "30 videos per month",
      "1080p quality",
      "No watermark",
      "Premium AI voices",
      "Voice cloning",
      "Priority email support",
    ],
    agency: [
      "100 videos per month",
      "4K quality",
      "White-label exports",
      "Custom AI avatars",
      "Team workspaces",
      "API access",
      "Priority rendering",
      "Dedicated support",
    ],
  };
  return features[plan] || [];
}