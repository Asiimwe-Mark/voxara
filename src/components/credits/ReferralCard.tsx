"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Users, Zap, CheckCheck, Loader2 } from "lucide-react"

interface ReferralStats {
  referralCode: string
  referralUrl: string
  totalReferrals: number
  totalCreditsEarned: number
  creditsPerReferral: number
}

export function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then(setStats)
      .catch((e) => process.env.NODE_ENV !== 'production' && console.error(e))
      .finally(() => setLoading(false))
  }, [])

  async function handleCopy() {
    if (!stats?.referralUrl) return
    await navigator.clipboard.writeText(stats.referralUrl)
    setCopied(true)
    toast.success("Referral link copied!")
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <Card className="card-premium">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card className="card-premium border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 flex-shrink-0">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold tracking-tight">Refer &amp; Earn</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Get +{stats.creditsPerReferral} credits for every friend who signs up
              </CardDescription>
            </div>
          </div>

          {stats.totalReferrals > 0 && (
            <div className="text-right sm:text-left pl-7 sm:pl-0">
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 justify-end sm:justify-start">
                <Zap className="h-3.5 w-3.5" />
                <span className="tabular-nums">+{stats.totalCreditsEarned} earned</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {stats.totalReferrals} referral{stats.totalReferrals !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Referral Link Copy */}
        <div className="flex gap-2">
          <Input
            readOnly
            value={stats.referralUrl}
            className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm font-mono bg-background/60 focus-visible:ring-emerald-500/30 truncate"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-10 sm:h-11 w-10 sm:w-11 p-0 rounded-lg shrink-0 transition-smooth hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 border-emerald-200/50 dark:border-emerald-800/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            aria-label="Copy referral link"
          >
            {copied ? (
              <CheckCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            )}
          </Button>
        </div>

        {/* Milestone Badges */}
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 25].map((milestone) => (
            <Badge
              key={milestone}
              variant={stats.totalReferrals >= milestone ? "default" : "outline"}
              className={`text-xs shrink-0 transition-smooth ${
                stats.totalReferrals >= milestone
                  ? "bg-emerald-600 hover:bg-emerald-600 border-emerald-600 text-white"
                  : "text-muted-foreground border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
              }`}
            >
              <span className="tabular-nums">{milestone}</span> referral{milestone !== 1 ? "s" : ""}
              {stats.totalReferrals >= milestone ? " ✓" : ` → +${milestone * stats.creditsPerReferral} cr`}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Your friend also gets a bonus credit when they sign up with your link. No cap on referral credits.
        </p>
      </CardContent>
    </Card>
  )
}