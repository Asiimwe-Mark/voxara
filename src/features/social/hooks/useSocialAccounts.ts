'use client';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import logger from "@/lib/logger";

export type SocialPlatform = "youtube" | "tiktok" | "instagram" | "linkedin";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string;
  connected_at: string;
}

interface UseSocialAccountsReturn {
  /** List of connected social accounts. */
  accounts: SocialAccount[];
  /** Whether the initial fetch is loading. */
  isLoading: boolean;
  /** Whether a connection is in progress. */
  isConnecting: boolean;
  /** The platform currently being connected. */
  connectingPlatform: SocialPlatform | null;
  /** Connect a social account (redirects to OAuth). */
  connect: (platform: SocialPlatform) => void;
  /** Disconnect a social account. */
  disconnect: (accountId: string) => Promise<void>;
  /** Refresh the list of accounts. */
  refresh: () => Promise<void>;
  /** Check if a platform is connected. */
  isConnected: (platform: SocialPlatform) => boolean;
  /** Get the connected account for a platform. */
  getAccount: (platform: SocialPlatform) => SocialAccount | undefined;
}

export function useSocialAccounts(): UseSocialAccountsReturn {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from("social_accounts")
        .select("id, platform, account_id, account_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(
        data.map((acc: any) => ({
          id: String(acc.id),
          platform: acc.platform as SocialPlatform,
          account_id: String(acc.account_id),
          account_name: acc.account_name ?? '',
          connected_at: acc.created_at ?? new Date().toISOString(),
        }))
      );
    } catch (error) {
      logger.error("Failed to fetch social accounts:", { detail: error });
      toast.error("Failed to load connected accounts");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Subscribe to real‑time changes
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel("social-accounts-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "social_accounts",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchAccounts();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchAccounts]);

  const connect = useCallback((platform: SocialPlatform) => {
    setIsConnecting(true);
    setConnectingPlatform(platform);

    // Redirect to OAuth endpoint
    window.location.href = `/api/oauth/${platform}`;
  }, []);

  const disconnect = useCallback(
    async (accountId: string) => {
      try {
        const response = await fetch(`/api/oauth/disconnect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to disconnect");
        }

        // Optimistically remove from state
        setAccounts((prev) => prev.filter((a) => a.id !== accountId));
        toast.success("Account disconnected");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to disconnect");
        // Refresh to sync with server
        fetchAccounts();
      }
    },
    [fetchAccounts]
  );

  const isConnected = useCallback(
    (platform: SocialPlatform) => {
      return accounts.some((a) => a.platform === platform);
    },
    [accounts]
  );

  const getAccount = useCallback(
    (platform: SocialPlatform) => {
      return accounts.find((a) => a.platform === platform);
    },
    [accounts]
  );

  // Reset connecting state when returning from OAuth (component remounts)
  useEffect(() => {
    setIsConnecting(false);
    setConnectingPlatform(null);
  }, []);

  return {
    accounts,
    isLoading,
    isConnecting,
    connectingPlatform,
    connect,
    disconnect,
    refresh: fetchAccounts,
    isConnected,
    getAccount,
  };
}