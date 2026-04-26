"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseCreditsOptions {
  /** Optional user ID. If not provided, fetches the current authenticated user. */
  userId?: string;
  /** Whether to subscribe to real-time updates (default: true). */
  realtime?: boolean;
  /** Polling interval in milliseconds (default: 30000). Set to 0 to disable polling. */
  pollInterval?: number;
}

interface UseCreditsReturn {
  credits: number | null;
  isLoading: boolean;
  isSubscribed: boolean;
  refresh: () => Promise<void>;
  /** Deduct credits via server-side atomic RPC — prevents race conditions. */
  deduct: (amount: number) => Promise<boolean>;
  /** Add credits via server-side atomic RPC. */
  add: (amount: number) => Promise<void>;
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
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  // Initial fetch
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Real-time subscription
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
            if (mounted) setCredits(payload.new.credits);
          }
        )
        .subscribe((status) => {
          if (mounted) setIsSubscribed(status === "SUBSCRIBED");
        });
    };

    setupSubscription();
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, userId, realtime]);

  // Fallback polling
  useEffect(() => {
    if (realtime || pollInterval <= 0) return;
    const interval = setInterval(fetchCredits, pollInterval);
    return () => clearInterval(interval);
  }, [realtime, pollInterval, fetchCredits]);

  /**
   * Deduct credits using the server-side atomic RPC.
   * This is the ONLY correct way — direct DB updates bypass RLS and
   * create race conditions when multiple tabs/requests run concurrently.
   */
  const deduct = useCallback(
    async (amount: number): Promise<boolean> => {
      try {
        const res = await fetch("/api/v1/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deduct", amount }),
        });
        if (!res.ok) return false;
        // Let real-time subscription update the display;
        // optimistically update for instant feedback
        setCredits((c) => (c !== null ? Math.max(0, c - amount) : null));
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  /**
   * Add credits using the server-side atomic RPC.
   */
  const add = useCallback(async (amount: number): Promise<void> => {
    try {
      await fetch("/api/v1/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", amount }),
      });
      setCredits((c) => (c !== null ? c + amount : null));
    } catch {
      // Silently fail; real-time subscription will reconcile
    }
  }, []);

  return { credits, isLoading, isSubscribed, refresh: fetchCredits, deduct, add, error };
}
