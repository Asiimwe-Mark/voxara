"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Share2, Gift, Zap, Loader2,
  IconYoutube, IconInstagram, IconFacebook, IconXTwitter, IconTiktok,
} from "@/lib/icons"

interface Platform {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  shareUrl: (videoUrl: string, title: string) => string
  credits: number
}

const PLATFORMS: Platform[] = [
  {
    id: "tiktok",
    label: "TikTok",
    icon: IconTiktok,
    color: "bg-black hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-700",
    shareUrl: () => "https://www.tiktok.com/upload",
    credits: 1,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: IconInstagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    shareUrl: () => "https://www.instagram.com",
    credits: 1,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: IconYoutube,
    color: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
    shareUrl: (_videoUrl: string, title: string) =>
      `https://studio.youtube.com/channel/upload?title=${encodeURIComponent(title)}`,
    credits: 2,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: IconFacebook,
    color: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
    shareUrl: (videoUrl: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
    credits: 1,
  },
  {
    id: "x",
    label: "X / Twitter",
    icon: IconXTwitter,
    color: "bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-600",
    shareUrl: (videoUrl: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Just made this video with @VoxaraAI 🎬\n\n${title}\n\nMake yours free:`
      )}&url=${encodeURIComponent(videoUrl)}`,
    credits: 1,
  },
]

interface Props {
  videoId: string
  videoUrl: string
  videoTitle: string
  currentCredits: number
  onCreditsUpdated?: (newBalance: number) => void
}

export function ShareForCredits({
  videoId,
  videoUrl,
  videoTitle,
  currentCredits,
  onCreditsUpdated,
}: Props) {
  const [sharing, setSharing] = useState<string | null>(null)
  const [claimed, setClaimed] = useState<Set<string>>(new Set())

  async function handleShare(platform: Platform) {
    if (claimed.has(platform.id)) return

    setSharing(platform.id)

    // Open the share target in a new tab
    const shareTarget = platform.shareUrl(videoUrl, videoTitle)
    window.open(shareTarget, "_blank", "noopener,noreferrer")

    // Award credits server-side
    try {
      const res = await fetch("/api/credits/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.id, videoId }),
      })

      const data = await res.json()

      if (data.credited > 0) {
        toast.success(data.message, {
          description: `New balance: ${data.newBalance} credits`,
          duration: 4000,
        })
        setClaimed((prev) => new Set([...prev, platform.id]))
        onCreditsUpdated?.(data.newBalance)
      } else {
        toast.info(data.message ?? "Monthly sharing cap reached.", {
          description: "Cap resets on the 1st of each month.",
        })
        setClaimed((prev) => new Set([...prev, platform.id]))
      }
    } catch {
      toast.error("Could not record share. Please try again.")
    } finally {
      setSharing(null)
    }
  }

  return (
    <Card className="card-premium border-primary/30 bg-primary/5">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold tracking-tight">
                Earn free credits by sharing
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Share this video and get +1–2 credits per platform • up to 5/month
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="ml-auto sm:ml-0 shrink-0 text-xs sm:text-sm tabular-nums"
          >
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
            {currentCredits} credits
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon
            const isClaiming = sharing === platform.id
            const isClaimed = claimed.has(platform.id)

            return (
              <Button
                key={platform.id}
                size="sm"
                className={`
                  relative text-xs sm:text-sm h-10 sm:h-11 rounded-lg font-medium
                  transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                  ${platform.color} text-white gap-1.5
                  ${isClaimed ? "opacity-60 cursor-not-allowed" : ""}
                `}
                onClick={() => !isClaimed && handleShare(platform)}
                disabled={isClaiming || isClaimed}
                aria-label={isClaimed ? `Shared to ${platform.label}` : `Share to ${platform.label}`}
              >
                {isClaiming ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                <span className="truncate">{isClaimed ? "Shared ✓" : platform.label}</span>
                {!isClaimed && (
                  <Badge 
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] bg-emerald-500 border-0 shadow-sm"
                    aria-label={`Earn +${platform.credits} credits`}
                  >
                    +{platform.credits}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-3 sm:mt-4 flex items-start sm:items-center gap-1.5 leading-relaxed">
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            Credits are awarded once per platform per video. Upgrade to Pro for unlimited videos with no watermark.
          </span>
        </p>
      </CardContent>
    </Card>
  )
}