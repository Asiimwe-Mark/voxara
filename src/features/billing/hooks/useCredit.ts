"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseCreditsOptions {
  /** Optional user ID. If not provided, fetches the current authenticated user. */
  userId?: string;
  /** Whether to subscribe to real‑time updates (default: true). */
  realtime?: boolean;
  /** Polling interval in milliseconds (default: 30000). Set to 0 to disable polling. */
  pollInterval?: number;
}

interface UseCreditsReturn {
  /** Current credit balance, or null while loading. */
  credits: number | null;
  /** Whether the initial fetch is in progress. */
  isLoading: boolean;
  /** Whether a real‑time subscription is active. */
  isSubscribed: boolean;
  /** Manually refresh the credit balance. */
  refresh: () => Promise<void>;
  /** Deduct credits (optimistic update). */
  deduct: (amount: number) => Promise<boolean>;
  /** Add credits (optimistic update). */
  add: (amount: number) => Promise<void>;
  /** Error message, if any. */
  error: string | null;
}

export function useCredits(options: UseCreditsOptions = {}): UseCreditsReturn {
  const { userId, realtime = true, pollInterval = 30000 } = options;
  const supabase = createClient();

  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }
      if (!targetUserId) {
        setCredits(0);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", targetUserId)
        .single();

      if (fetchError) throw fetchError;
      setCredits(data?.credits ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credits");
      console.error("useCredits fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  // Initial fetch
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Real‑time subscription
  useEffect(() => {
    if (!realtime) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;

    const setupSubscription = async () => {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }
      if (!targetUserId) return;

      channel = supabase
        .channel(`credits-${targetUserId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${targetUserId}`,
          },
          (payload) => {
            if (mounted) {
              setCredits(payload.new.credits);
            }
          }
        )
        .subscribe((status) => {
          if (mounted) {
            setIsSubscribed(status === "SUBSCRIBED");
          }
        });
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, userId, realtime]);

  // Fallback polling (if realtime is disabled)
  useEffect(() => {
    if (realtime || pollInterval <= 0) return;

    const interval = setInterval(fetchCredits, pollInterval);
    return () => clearInterval(interval);
  }, [realtime, pollInterval, fetchCredits]);

  // Optimistic update helpers
  const deduct = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!credits || credits < amount) return false;

      const previousCredits = credits;
      setCredits(credits - amount);

      try {
        const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!targetUserId) throw new Error("User not found");

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ credits: previousCredits - amount })
          .eq("id", targetUserId);

        if (updateError) throw updateError;
        return true;
      } catch (err) {
        setCredits(previousCredits);
        setError(err instanceof Error ? err.message : "Failed to deduct credits");
        return false;
      }
    },
    [credits, supabase, userId]
  );

  const add = useCallback(
    async (amount: number): Promise<void> => {
      if (!credits && credits !== 0) return;

      const previousCredits = credits ?? 0;
      setCredits(previousCredits + amount);

      try {
        const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!targetUserId) throw new Error("User not found");

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ credits: previousCredits + amount })
          .eq("id", targetUserId);

        if (updateError) throw updateError;
      } catch (err) {
        setCredits(previousCredits);
        setError(err instanceof Error ? err.message : "Failed to add credits");
      }
    },
    [credits, supabase, userId]
  );

  return {
    credits,
    isLoading,
    isSubscribed,
    refresh: fetchCredits,
    deduct,
    add,
    error,
  };
}