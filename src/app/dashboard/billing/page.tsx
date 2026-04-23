'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Coins,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const CREDIT_PACKS = [
  { credits: 10, price: 900, label: '$9' },
  { credits: 25, price: 1900, label: '$19', popular: true },
  { credits: 50, price: 2900, label: '$29' },
]

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [creditPurchases, setCreditPurchases] = useState<any[]>([])
  const [autoTopUp, setAutoTopUp] = useState({
    enabled: false,
    threshold: 5,
    top_up_amount: 25,
  })
  const [isSavingAutoTopUp, setIsSavingAutoTopUp] = useState(false)
  const [purchasingPack, setPurchasingPack] = useState<number | null>(null)

  useEffect(() => {
    loadBillingData()
    loadAutoTopUpSettings()
  }, [])

  async function loadBillingData() {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      const purchasesPromise = supabase
        .from('credit_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Try new payment_subscriptions table first, fall back to old stripe_subscriptions
      let subData = null
      const { data: newSubData } = await supabase
        .from('payment_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (newSubData) {
        subData = newSubData
      } else {
        const { data: legacySubData } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        subData = legacySubData
      }

      const [{ data: profileData }, { data: purchases }] = await Promise.all([
        profilePromise,
        purchasesPromise,
      ])

      setProfile(profileData)
      setSubscription(subData)
      setCreditPurchases(purchases || [])
    } catch (error) {
      toast.error('Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadAutoTopUpSettings() {
    try {
      const response = await fetch('/api/billing/auto-top-up')
      if (response.ok) setAutoTopUp(await response.json())
    } catch {}
  }

  async function handleManageBilling() {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal')
    } finally {
      setIsPortalLoading(false)
    }
  }

  async function saveAutoTopUp(settings: typeof autoTopUp) {
    setIsSavingAutoTopUp(true)
    try {
      await fetch('/api/billing/auto-top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      toast.success('Auto top-up settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSavingAutoTopUp(false)
    }
  }

  async function handleBuyCredits(pack: (typeof CREDIT_PACKS)[0]) {
    setPurchasingPack(pack.credits)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: 'credit_pack',
          credits: pack.credits,
          successUrl: `${window.location.origin}/dashboard?credits=purchased`,
          cancelUrl: `${window.location.origin}/dashboard/billing`,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to process purchase'
      )
    } finally {
      setPurchasingPack(null)
    }
  }

  function getPlanBadge(plan: string) {
    const variants: Record<string, { label: string; className: string }> = {
      pro: { label: 'Pro', className: 'bg-blue-500 text-white' },
      agency: { label: 'Agency', className: 'bg-purple-500 text-white' },
      free: { label: 'Free', className: '' },
    }
    const v = variants[plan] ?? variants.free
    return (
      <Badge
        className={v.className}
        variant={plan === 'free' ? 'outline' : 'default'}
      >
        {v.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isActive = subscription?.status === 'active'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Billing & Subscription
        </h2>
        <p className="text-muted-foreground">
          Manage your plan, credits, and payment methods
        </p>
      </div>

      {/* Overview grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Current Plan
              </span>
              {getPlanBadge(profile?.plan ?? 'free')}
            </div>
            <p className="text-2xl font-bold capitalize">
              {profile?.plan ?? 'Free'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Available Credits
              </span>
            </div>
            <p className="text-2xl font-bold">{profile?.credits ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Subscription Status
              </span>
            </div>
            {isActive ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  Active
                </span>
                {(subscription?.renews_at ||
                  subscription?.current_period_end) && (
                  <span className="text-xs text-muted-foreground ml-1">
                    · renews{' '}
                    {new Date(
                      subscription?.renews_at ||
                        subscription?.current_period_end
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  No active subscription
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manage Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Billing</CardTitle>
          <CardDescription>
            Update payment method, view invoices, or change your plan
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleManageBilling}
            disabled={isPortalLoading}
            className="flex-1 sm:flex-none"
          >
            {isPortalLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Customer Portal
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/pricing')}
            className="flex-1 sm:flex-none"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {profile?.plan === 'free' ? 'Upgrade Plan' : 'View Plans'}
          </Button>
        </CardContent>
      </Card>

      {/* Buy Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Buy Credits
          </CardTitle>
          <CardDescription>
            One-time credit packs — never expire, use any time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className={`relative rounded-lg border p-4 text-center ${pack.popular ? 'border-primary shadow-sm' : ''}`}
              >
                {pack.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
                    Best Value
                  </Badge>
                )}
                <p className="text-2xl font-bold mt-2">{pack.credits}</p>
                <p className="text-sm text-muted-foreground mb-1">credits</p>
                <p className="text-lg font-semibold mb-4">{pack.label}</p>
                <Button
                  className="w-full"
                  variant={pack.popular ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBuyCredits(pack)}
                  disabled={purchasingPack !== null}
                >
                  {purchasingPack === pack.credits ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto Top-Up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Auto Top-Up
          </CardTitle>
          <CardDescription>
            Automatically purchase credits when your balance runs low
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Auto Top-Up</p>
              <p className="text-xs text-muted-foreground">
                Requires a saved payment method in the portal
              </p>
            </div>
            <Switch
              checked={autoTopUp.enabled}
              disabled={isSavingAutoTopUp}
              onCheckedChange={(v) => {
                const updated = { ...autoTopUp, enabled: v }
                setAutoTopUp(updated)
                saveAutoTopUp(updated)
              }}
            />
          </div>
          {autoTopUp.enabled && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Top-up when below
                  </label>
                  <Select
                    value={autoTopUp.threshold.toString()}
                    onValueChange={(v) => {
                      const updated = { ...autoTopUp, threshold: parseInt(v) }
                      setAutoTopUp(updated)
                      saveAutoTopUp(updated)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 credits</SelectItem>
                      <SelectItem value="5">5 credits</SelectItem>
                      <SelectItem value="10">10 credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Purchase amount</label>
                  <Select
                    value={autoTopUp.top_up_amount.toString()}
                    onValueChange={(v) => {
                      const updated = {
                        ...autoTopUp,
                        top_up_amount: parseInt(v),
                      }
                      setAutoTopUp(updated)
                      saveAutoTopUp(updated)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 credits ($9)</SelectItem>
                      <SelectItem value="25">25 credits ($19)</SelectItem>
                      <SelectItem value="50">50 credits ($29)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Purchase History */}
      {creditPurchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {creditPurchases.map((purchase, i) => (
                <div
                  key={purchase.id}
                  className={`flex items-center justify-between py-3 ${i < creditPurchases.length - 1 ? 'border-b' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      +{purchase.credits_purchased} credits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(purchase.created_at).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatPrice(purchase.amount_paid)}
                    </p>
                    <Badge
                      variant={
                        purchase.status === 'completed' ? 'default' : 'outline'
                      }
                      className="text-xs"
                    >
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
