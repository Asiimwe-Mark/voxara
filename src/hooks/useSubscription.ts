'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PlanType = 'free' | 'pro' | 'agency';

export interface SubscriptionDetails {
  plan: PlanType;
  credits: number;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused' | null;
  currentPeriodEnd: Date | null;
  paymentCustomerId: string | null;
  paymentSubscriptionId: string | null;
  provider: 'paddle' | 'flutterwave' | null;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const supabase = createClient();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSubscription(null); return; }

      const [{ data: profile }, { data: customer }, { data: sub }] = await Promise.all([
        supabase.from('profiles').select('plan, credits').eq('id', user.id).single(),
        supabase.from('payment_customers')
          .select('payment_customer_id, provider')
          .eq('user_id', user.id).maybeSingle(),
        supabase.from('payment_subscriptions')
          .select('subscription_id, status, renews_at, provider')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing', 'paused'])
          .order('created_at', { ascending: false })
          .limit(1).maybeSingle(),
      ]);

      setSubscription({
        plan:                  (profile?.plan as PlanType) ?? 'free',
        credits:               profile?.credits ?? 1,
        status:                sub?.status ?? null,
        currentPeriodEnd:      sub?.renews_at ? new Date(sub.renews_at) : null,
        paymentCustomerId:     customer?.payment_customer_id ?? null,
        paymentSubscriptionId: sub?.subscription_id ?? null,
        provider:              (sub?.provider ?? customer?.provider ?? null) as 'paddle' | 'flutterwave' | null,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  return { subscription, isLoading, error, refresh: fetch };
}
