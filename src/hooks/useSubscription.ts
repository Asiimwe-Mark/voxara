"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type PlanType = "free" | "pro" | "agency";

interface SubscriptionDetails {
  plan: PlanType;
  status: "active" | "canceled" | "past_due" | "trialing" | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  paymentCustomerId: string | null;
  paymentSubscriptionId: string | null;
  provider: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  error: string | null;
}

export function useSubscription(): UseSubscriptionReturn {
  const supabase = createClient();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      // Try new payment_customers table first, fall back to stripe_customers for legacy data
      let paymentCustomer = null;
      let provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'lemon-squeezy';

      const { data: newPaymentCustomer } = await supabase
        .from("payment_customers")
        .select("payment_customer_id, provider")
        .eq("user_id", user.id)
        .maybeSingle();

      if (newPaymentCustomer) {
        paymentCustomer = newPaymentCustomer;
        provider = newPaymentCustomer.provider;
      } else {
        // Fall back to stripe_customers for backward compatibility
        const { data: legacyCustomer } = await supabase
          .from("stripe_customers")
          .select("stripe_customer_id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (legacyCustomer) {
          paymentCustomer = { 
            payment_customer_id: legacyCustomer.stripe_customer_id,
            provider: 'stripe'
          };
          provider = 'stripe';
        }
      }

      // Try new payment_subscriptions table first, fall back to stripe_subscriptions
      let paymentSub = null;

      const { data: newSub } = await supabase
        .from("payment_subscriptions")
        .select("subscription_id, status, renews_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (newSub) {
        paymentSub = newSub;
      } else {
        // Fall back to stripe_subscriptions for backward compatibility
        const { data: legacySub } = await supabase
          .from("stripe_subscriptions")
          .select("stripe_subscription_id, status, current_period_end, cancel_at_period_end")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (legacySub) {
          paymentSub = {
            subscription_id: legacySub.stripe_subscription_id,
            status: legacySub.status,
            renews_at: legacySub.current_period_end
          };
        }
      }

      setSubscription({
        plan: (profile?.plan as PlanType) || "free",
        status: paymentSub?.status || null,
        currentPeriodEnd: paymentSub?.renews_at
          ? new Date(paymentSub.renews_at)
          : null,
        cancelAtPeriodEnd: false,
        paymentCustomerId: paymentCustomer?.payment_customer_id || null,
        paymentSubscriptionId: paymentSub?.subscription_id || null,
        provider
          paymentCustomer = { 
            payment_customer_id: legacyCustomer.stripe_customer_id,
            provider: 'stripe'
          };
          provider = 'stripe';
        }
      }

      // Try new payment_subscriptions table first, fall back to stripe_subscriptions
      let paymentSub = null;

      const { data: newSub } = await supabase
        .from("payment_subscriptions")
        .select("subscription_id, status, renews_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (newSub) {
        paymentSub = newSub;
      } else {
        // Fall back to stripe_subscriptions for backward compatibility
        const { data: legacySub } = await supabase
          .from("stripe_subscriptions")
          .select("stripe_subscription_id, status, current_period_end, cancel_at_period_end")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (legacySub) {
          paymentSub = {
            subscription_id: legacySub.stripe_subscription_id,
            status: legacySub.status,
            renews_at: legacySub.current_period_end
          };
        }
      }

      setSubscription({
        plan: (profile?.plan as PlanType) || "free",
        status: paymentSub?.status || null,
        currentPeriodEnd: paymentSub?.renews_at
          ? new Date(paymentSub.renews_at)
          : null,
        cancelAtPeriodEnd: false,
        paymentCustomerId: paymentCustomer?.payment_customer_id || null,
        paymentSubscriptionId: paymentSub?.subscription_id || null,
        provider,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subscription");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    isLoading,
    refresh: fetchSubscription,
    error,
  };
}