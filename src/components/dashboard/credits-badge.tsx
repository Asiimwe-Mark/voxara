"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface CreditsBadgeProps {
  userId?: string;
  initialCredits?: number;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "outline" | "secondary";
}

export function CreditsBadge({
  userId,
  initialCredits,
  className = "",
  showIcon = true,
  variant = "outline",
}: CreditsBadgeProps) {
  const [credits, setCredits] = useState<number | null>(initialCredits ?? null);
  const [isLoading, setIsLoading] = useState(!initialCredits);
  const supabase = createClient();

  useEffect(() => {
    if (initialCredits !== undefined) {
      setCredits(initialCredits);
      setIsLoading(false);
      return;
    }

    async function fetchCredits() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCredits(0);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", userId || user.id)
          .single();

        setCredits(profile?.credits ?? 0);
      } catch (error) {
        process.env.NODE_ENV !== 'production' && console.error("Failed to fetch credits:", error);
        setCredits(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCredits();

    // Subscribe to realtime updates for credits
    const channel = supabase
      .channel("credits-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: userId ? `id=eq.${userId}` : undefined,
        },
        (payload) => {
          setCredits(payload.new.credits);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialCredits, userId, supabase]);

  if (isLoading) {
    return (
      <Badge variant={variant} className={`gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>...</span>
      </Badge>
    );
  }

  return (
    <Badge variant={variant} className={`gap-1 ${className}`}>
      {showIcon && <Coins className="h-3 w-3 text-yellow-500" />}
      <span>{credits} credit{credits !== 1 ? "s" : ""}</span>
    </Badge>
  );
}