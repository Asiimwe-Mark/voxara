"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { Calendar, Clock, Send, AlertCircle, Hash, Smile } from "lucide-react"
import { IconYoutube, IconInstagram, IconLinkedin, IconTiktok } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface SocialAccount {
  id: string
  platform: string
  account_name: string
}

export function PublishingScheduler({ videoId }: { videoId: string }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [caption, setCaption] = useState("")
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const supabase = createClient()

  // Load connected accounts on mount
  useEffect(() => {
    loadAccounts()
  }, [])

  async function loadAccounts() {
    const { data } = await supabase
      .from("social_accounts")
      .select("id, platform, account_name")
      .order("platform")
    setAccounts(data || [])
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  // Validation & Derived State
  const connectedPlatforms = useMemo(() => accounts.map((a) => a.platform), [accounts])
  
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return "UTC"
    }
  }, [])

  const scheduledDateTime = scheduleType === "later" && scheduledDate && scheduledTime
    ? new Date(`${scheduledDate}T${scheduledTime}`)
    : null

  const isScheduledValid = scheduledDateTime && scheduledDateTime > new Date()
  const relativeTimePreview = scheduledDateTime
    ? `Scheduling for ${scheduledDateTime.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: userTimezone,
      })}`
    : null

  const charCount = caption.length
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0
  const charLimit = 2200
  const charThreshold = charLimit * 0.9

  const canSubmit = selectedPlatforms.length > 0 &&
    !isPublishing &&
    (scheduleType === "now" || Boolean(isScheduledValid))

  async function handlePublish() {
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform")
      return
    }

    if (scheduleType === "later") {
      if (!scheduledDate || !scheduledTime) {
        toast.error("Choose a date and time to schedule publishing")
        return
      }

      if (!isScheduledValid) {
        toast.error("Scheduled time must be in the future")
        return
      }
    }

    setIsPublishing(true)
    try {
      const scheduledAt =
        scheduleType === "later" && scheduledDateTime
          ? scheduledDateTime.toISOString()
          : new Date(Date.now() + 60_000).toISOString()

      const results = await Promise.allSettled(
        selectedPlatforms.map(async (platform) => {
          const response = await fetch("/api/publish/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              videoId,
              platform,
              scheduledAt,
              caption,
            }),
          })

          const data = await response.json()
          if (!response.ok) throw new Error(data.error || `Failed to schedule ${platform}`)
          return data
        })
      )

      const failed = results.filter((result) => result.status === "rejected")
      if (failed.length === selectedPlatforms.length) {
        const firstError = failed[0] as PromiseRejectedResult
        throw firstError.reason
      }

      if (failed.length > 0) {
        toast.warning(`${selectedPlatforms.length - failed.length} scheduled, ${failed.length} failed`)
      } else if (scheduleType === "now") {
        toast.success("Publishing queued. Check status in Publishing tab.")
      } else {
        toast.success(relativeTimePreview ?? "Post scheduled successfully!")
      }

      // Reset form on success
      setSelectedPlatforms([])
      setCaption("")
      setScheduledDate("")
      setScheduledTime("")
      setScheduleType("now")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publishing failed")
    } finally {
      setIsPublishing(false)
    }
  }

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <IconInstagram className="h-4 w-4 sm:h-5 sm:w-5" />,
    linkedin:  <IconLinkedin  className="h-4 w-4 sm:h-5 sm:w-5" />,
    youtube:   <IconYoutube   className="h-4 w-4 sm:h-5 sm:w-5" />,
    tiktok:    <IconTiktok    className="h-4 w-4 sm:h-5 sm:w-5" />,
  }

  const platformColors: Record<string, string> = {
    tiktok: "bg-zinc-900 dark:bg-zinc-800 text-white",
    instagram: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
    linkedin: "bg-blue-700 dark:bg-blue-600 text-white",
    youtube: "bg-red-600 dark:bg-red-700 text-white",
  }

  return (
    <Card className="card-premium max-w-3xl mx-auto">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl tracking-tight">
          Publish to Social Media
        </CardTitle>
        <CardDescription className="text-sm sm:text-base mt-1">
          Share your video to multiple platforms at once
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5 sm:space-y-6">
        {/* Platform Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Platforms</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {["tiktok", "instagram", "linkedin", "youtube"].map((platform) => {
              const isConnected = connectedPlatforms.includes(platform)
              const isSelected = selectedPlatforms.includes(platform)

              return (
                <div
                  key={platform}
                  className={`
                    flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-smooth touch-manipulation
                    ${isSelected 
                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" 
                      : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    }
                    ${!isConnected ? "opacity-50 cursor-not-allowed hover:border-border/50 hover:bg-transparent" : ""}
                  `}
                  onClick={() => isConnected && togglePlatform(platform)}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-disabled={!isConnected}
                  tabIndex={isConnected ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && isConnected) {
                      e.preventDefault()
                      togglePlatform(platform)
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!isConnected}
                    className="pointer-events-none h-4 w-4 sm:h-5 sm:w-5"
                    aria-hidden="true"
                  />
                  <div className={`p-2 rounded-lg ${platformColors[platform]}`}>
                    {platformIcons[platform]}
                  </div>
                  <span className="capitalize flex-1 text-sm sm:text-base font-medium truncate">
                    {platform}
                  </span>
                  <Badge 
                    variant={isConnected ? "secondary" : "outline"} 
                    className={`text-[10px] sm:text-xs shrink-0 ${
                      isConnected ? "bg-muted/50" : "text-muted-foreground"
                    }`}
                  >
                    {isConnected ? "Linked" : "Connect"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Caption with Smart Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="caption" className="text-sm font-medium">
              Caption
            </Label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span className="tabular-nums">{wordCount} words</span>
            </div>
          </div>
          <div className="relative">
            <Textarea
              id="caption"
              placeholder="Write a caption for your post... Use @mentions, #hashtags, and emojis 🚀"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="min-h-[100px] sm:min-h-[120px] rounded-lg text-sm resize-y focus-visible:ring-primary/30 pr-8"
              maxLength={charLimit}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-none">
              <Smile className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
          </div>
          <div className="flex justify-end items-center gap-2">
            <span 
              className={`text-xs tabular-nums font-medium ${
                charCount > charLimit ? "text-destructive" :
                charCount > charThreshold ? "text-amber-500" :
                "text-muted-foreground"
              }`}
            >
              {charCount}/{charLimit}
            </span>
          </div>
        </div>

        {/* Schedule Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Schedule</Label>
          <Tabs 
            value={scheduleType} 
            onValueChange={(v) => setScheduleType(v as "now" | "later")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11 rounded-lg">
              <TabsTrigger value="now" className="text-xs sm:text-sm data-[state=active]:bg-background">
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Publish Now</span>
                <span className="sm:hidden">Now</span>
              </TabsTrigger>
              <TabsTrigger value="later" className="text-xs sm:text-sm data-[state=active]:bg-background">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Schedule</span>
                <span className="sm:hidden">Later</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="later" className="pt-4 space-y-4 focus:outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date" className="text-xs sm:text-sm">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time" className="text-xs sm:text-sm">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
                  />
                </div>
              </div>
              
              {/* Timezone & Validation Preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timezone: {userTimezone}
                </span>
                {scheduleType === "later" && scheduledDate && (
                  <span className={`flex items-center gap-1 ${!isScheduledValid ? "text-amber-500" : "text-emerald-500"}`}>
                    <AlertCircle className="h-3 w-3" />
                    {relativeTimePreview || "Select a valid date & time"}
                  </span>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handlePublish}
          disabled={!canSubmit}
          className="h-11 sm:h-12 w-full rounded-xl text-sm sm:text-base font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : scheduleType === "now" ? (
            <>
              <Send className="mr-2 h-4 w-4" /> Publish Now
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Post
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}