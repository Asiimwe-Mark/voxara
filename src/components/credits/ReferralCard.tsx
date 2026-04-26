"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Zap, CheckCheck } from "lucide-react";
interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  totalCreditsEarned: number;
  creditsPerReferral: number;
}

export function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then(setStats)
      .catch((e) => process.env.NODE_ENV !== 'production' && console.error(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleCopy() {
    if (!stats?.referralUrl) return;
    await navigator.clipboard.writeText(stats.referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="border-green-200 bg-green-50/40 dark:border-green-900 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Refer &amp; Earn</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Get +{stats.creditsPerReferral} credits for every friend who signs up
              </CardDescription>
            </div>
          </div>

          {stats.totalReferrals > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                <Zap className="h-3.5 w-3.5" />
                +{stats.totalCreditsEarned} earned
              </div>
              <p className="text-xs text-muted-foreground">{stats.totalReferrals} referral{stats.totalReferrals !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Referral link copy */}
        <div className="flex gap-2">
          <Input
            readOnly
            value={stats.referralUrl}
            className="text-xs h-9 bg-background"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="shrink-0 h-9 w-9 p-0"
            aria-label="Copy referral link"
          >
            {copied ? (
              <CheckCheck className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Milestone badges */}
        <div className="flex flex-wrap gap-1.5">
          {[1, 5, 10, 25].map((milestone) => (
            <Badge
              key={milestone}
              variant={stats.totalReferrals >= milestone ? "default" : "outline"}
              className={`text-[11px] ${
                stats.totalReferrals >= milestone
                  ? "bg-green-600 border-green-600 text-white"
                  : "text-muted-foreground"
              }`}
            >
              {milestone} referral{milestone !== 1 ? "s" : ""}
              {stats.totalReferrals >= milestone ? " ✓" : ` → +${milestone * stats.creditsPerReferral} cr`}
            </Badge>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Your friend also gets a bonus credit when they sign up with your link. No cap on referral credits.
        </p>
      </CardContent>
    </Card>
  );
}
