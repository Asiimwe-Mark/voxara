"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { PlayCircle, Music2, Briefcase, Link2, Loader2, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { IconYoutube, IconInstagram, IconFacebook, IconLinkedin, IconTiktok } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Separator } from "@/components/ui/separator"

interface SocialAccount {
  id: string
  platform: string
  account_name: string
}

interface ConnectedAccountsProps {
  userId: string
  initialAccounts: SocialAccount[]
}

const platformConfig = {
  youtube: {
    name: "YouTube",
    icon: IconYoutube,
    color: "bg-red-600 dark:bg-red-700",
    oauthUrl: "/api/oauth/youtube",
    supported: true,
    permissions: ["Manage videos", "View analytics"],
  },
  tiktok: {
    name: "TikTok",
    icon: IconTiktok,
    color: "bg-zinc-900 dark:bg-zinc-800",
    oauthUrl: "/api/oauth/tiktok",
    supported: true,
    permissions: ["Publish videos", "View insights"],
  },
  instagram: {
    name: "Instagram",
    icon: IconInstagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    oauthUrl: "/api/oauth/instagram",
    supported: true,
    permissions: ["Publish to feed", "Access insights"],
  },
  linkedin: {
    name: "LinkedIn",
    icon: IconLinkedin,
    color: "bg-blue-700 dark:bg-blue-600",
    oauthUrl: "/api/oauth/linkedin",
    supported: false,
    permissions: ["Share posts", "Company page access"],
  },
  facebook: {
    name: "Facebook",
    icon: IconFacebook,
    color: "bg-blue-600 dark:bg-blue-700",
    oauthUrl: "/api/oauth/facebook",
    supported: false,
    permissions: ["Publish to pages", "View page insights"],
  },
} as const

type PlatformKey = keyof typeof platformConfig

export function ConnectedAccounts({ userId, initialAccounts }: ConnectedAccountsProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts)
  const [connecting, setConnecting] = useState<PlatformKey | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [lastConnected, setLastConnected] = useState<string | null>(null)
  const supabase = createClient()

  // Pro Tip: Memoized lookup for performance
  const accountsByPlatform = useMemo(() => {
    const map = new Map<string, SocialAccount>()
    accounts.forEach((a) => map.set(a.platform, a))
    return map
  }, [accounts])

  const handleConnect = useCallback((platform: PlatformKey) => {
    setConnecting(platform)
    // Optional: track connect intent for analytics
    // analytics.track('oauth_initiated', { platform })
    window.location.href = platformConfig[platform].oauthUrl
  }, [])

  const handleDisconnect = useCallback(async (accountId: string, platform: PlatformKey) => {
    setDisconnecting(accountId)
    try {
      const response = await fetch(`/api/oauth/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      })

      if (!response.ok) throw new Error("Failed to disconnect")

      setAccounts((prev) => prev.filter((a) => a.id !== accountId))
      toast.success(`${platformConfig[platform].name} disconnected`)
    } catch (error) {
      toast.error("Failed to disconnect account")
    } finally {
      setDisconnecting(null)
    }
  }, [])

  // Pro Tip: Bulk disconnect all accounts
  const handleDisconnectAll = useCallback(async () => {
    if (accounts.length === 0) return
    setDisconnecting("bulk")
    try {
      const promises = accounts.map((a) =>
        fetch(`/api/oauth/disconnect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: a.id }),
        })
      )
      const results = await Promise.all(promises)
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) throw new Error(`${failed.length} disconnects failed`)
      setAccounts([])
      toast.success("All accounts disconnected")
    } catch {
      toast.error("Failed to disconnect some accounts")
    } finally {
      setDisconnecting(null)
    }
  }, [accounts])

  // Pro Tip: Copy account name for support/debugging
  const copyAccountName = useCallback((name: string) => {
    navigator.clipboard.writeText(name).then(() => {
      toast.success("Account name copied")
    })
  }, [])

  const getConnectedAccount = useCallback((platform: string) => {
    return accountsByPlatform.get(platform)
  }, [accountsByPlatform])

  return (
    <Card className="card-glow rounded-2xl max-w-3xl mx-auto">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl tracking-tight border-l-2 border-primary pl-3">
              <Link2 className="h-5 w-5 text-primary" />
              Connected Accounts
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1.5">
              Connect your social media accounts to publish videos directly
            </CardDescription>
          </div>
          {accounts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnectAll}
              disabled={disconnecting === "bulk"}
              className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
            >
              {disconnecting === "bulk" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Disconnect All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        {Object.entries(platformConfig).map(([key, config]) => {
          const platform = key as PlatformKey
          const connected = getConnectedAccount(platform)
          const Icon = config.icon
          const isConnecting = connecting === platform
          const isDisconnecting = disconnecting === (connected?.id ?? "")

          return (
            <div key={platform} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-smooth bg-muted/10 touch-manipulation">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className={`p-2 sm:p-2.5 rounded-xl ${config.color} text-white flex-shrink-0 shadow-sm`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium truncate">{config.name}</p>
                    {connected && lastConnected === connected.id && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs animate-pulse">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Just connected
                      </Badge>
                    )}
                    {!config.supported && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  {connected ? (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p 
                        className="text-sm text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => copyAccountName(connected.account_name)}
                        title="Click to copy account name"
                      >
                        {connected.account_name}
                      </p>
                      <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
                      <div className="flex flex-wrap gap-1">
                        {config.permissions.slice(0, 2).map((p, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-muted/50">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Not connected · {config.supported ? `${config.permissions.length} permissions required` : "Connection coming soon"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {connected ? (
                  <>
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50">
                      Connected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDisconnect(connected.id, platform)}
                      disabled={isDisconnecting}
                      className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                      aria-label={`Disconnect ${config.name}`}
                    >
                      {isDisconnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting || !config.supported}
                    className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto"
                  >
                    {isConnecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-4 w-4" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        
        {/* OAuth Permissions Info */}
        <div className="mt-2 p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground mb-1">About permissions</p>
              <p>
                Connecting an account grants Voxara limited access to publish videos and view basic analytics. 
                You can revoke access anytime from your account settings or the platform's security page.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}