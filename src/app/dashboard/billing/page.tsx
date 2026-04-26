'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CreditCard, CheckCircle2, XCircle, Loader2,
  ExternalLink, Coins, RefreshCw, TrendingUp, Zap,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Switch }   from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanType = 'free' | 'pro' | 'agency'

interface Profile {
  id: string
  plan: PlanType
  credits: number
  email: string
  full_name?: string | null
}

interface PaymentSubscription {
  id: string
  status: string
  renews_at?: string | null
  provider: string
}

interface CreditPurchase {
  id: string
  credits_purchased: number
  amount_paid: number
  status: string
  created_at: string
}

interface AutoTopUpState {
  enabled: boolean
  threshold: number
  top_up_amount: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CREDIT_PACKS = [
  { credits: 10, price: 900,  label: '$9'  },
  { credits: 25, price: 1900, label: '$19', popular: true },
  { credits: 50, price: 2900, label: '$29' },
] as const

const PLAN_BADGE: Record<PlanType, { label: string; className: string }> = {
  free:   { label: 'Free',   className: '' },
  pro:    { label: 'Pro',    className: 'bg-blue-500 text-white' },
  agency: { label: 'Agency', className: 'bg-purple-500 text-white' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading,        setIsLoading]        = useState(true)
  const [isPortalLoading,  setIsPortalLoading]  = useState(false)
  const [isSavingAutoTopUp,setIsSavingAutoTopUp]= useState(false)
  const [purchasingPack,   setPurchasingPack]   = useState<number | null>(null)
  const [profile,          setProfile]          = useState<Profile | null>(null)
  const [subscription,     setSubscription]     = useState<PaymentSubscription | null>(null)
  const [creditPurchases,  setCreditPurchases]  = useState<CreditPurchase[]>([])
  const [autoTopUp,        setAutoTopUp]        = useState<AutoTopUpState>({
    enabled: false, threshold: 5, top_up_amount: 25,
  })

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadBillingData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: profileData }, { data: subData }, { data: purchases }] = await Promise.all([
        supabase.from('profiles').select('id,plan,credits,email,full_name').eq('id', user.id).single(),
        supabase.from('payment_subscriptions')
          .select('id,status,renews_at,provider')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing', 'paused'])
          .order('created_at', { ascending: false })
          .limit(1).maybeSingle(),
        supabase.from('credit_purchases')
          .select('id,credits_purchased,amount_paid,status,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setProfile(profileData as Profile)
      setSubscription(subData as PaymentSubscription | null)
      setCreditPurchases((purchases ?? []) as CreditPurchase[])
    } catch {
      toast.error('Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  const loadAutoTopUpSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/auto-top-up')
      if (res.ok) setAutoTopUp(await res.json() as AutoTopUpState)
    } catch { /* non-fatal */ }
  }, [])

  useEffect(() => {
    loadBillingData()
    loadAutoTopUpSettings()
  }, [loadBillingData, loadAutoTopUpSettings])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleManageBilling() {
    setIsPortalLoading(true)
    try {
      const res  = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: `${window.location.origin}/dashboard/billing` }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Portal error')
      window.location.href = data.url!
    } catch {
      toast.error('Failed to open billing portal')
    } finally {
      setIsPortalLoading(false)
    }
  }

  async function saveAutoTopUp(settings: AutoTopUpState) {
    setIsSavingAutoTopUp(true)
    try {
      await fetch('/api/billing/auto-top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      toast.success('Auto top-up settings saved')
    } catch {
      toast.error('Failed to save auto top-up settings')
    } finally {
      setIsSavingAutoTopUp(false)
    }
  }

  async function handleBuyCredits(pack: typeof CREDIT_PACKS[number]) {
    setPurchasingPack(pack.credits)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode:       'payment',
          credits:    pack.credits,
          successUrl: `${window.location.origin}/dashboard?credits=purchased`,
          cancelUrl:  `${window.location.origin}/dashboard/billing`,
        }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Checkout error')
      if (data.url) window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setPurchasingPack(null)
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const plan     = (profile?.plan ?? 'free') as PlanType
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const badge    = PLAN_BADGE[plan]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing &amp; Subscription</h2>
        <p className="text-muted-foreground">Manage your plan, credits, and payment methods</p>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Plan</span>
              <Badge className={badge.className} variant={plan === 'free' ? 'outline' : 'default'}>
                {badge.label}
              </Badge>
            </div>
            <p className="text-2xl font-bold capitalize">{plan}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Available Credits</span>
            </div>
            <p className="text-2xl font-bold">{profile?.credits ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Subscription Status</span>
            </div>
            {isActive ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
                {subscription?.renews_at && (
                  <span className="text-xs text-muted-foreground ml-1">
                    · renews {new Date(subscription.renews_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No active subscription</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manage billing */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Billing</CardTitle>
          <CardDescription>Update payment method, view invoices, or change your plan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleManageBilling} disabled={isPortalLoading}>
            {isPortalLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <CreditCard className="mr-2 h-4 w-4" />}
            Customer Portal
          </Button>
          <Button variant="outline" onClick={() => router.push('/pricing')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {plan === 'free' ? 'Upgrade Plan' : 'View Plans'}
          </Button>
        </CardContent>
      </Card>

      {/* Credit packs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />Buy Credits
          </CardTitle>
          <CardDescription>One-time credit packs — never expire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className={`relative rounded-lg border p-4 text-center ${pack.popular ? 'border-primary shadow-sm' : ''}`}
              >
                {pack.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">Best Value</Badge>
                )}
                <p className="text-2xl font-bold mt-2">{pack.credits}</p>
                <p className="text-sm text-muted-foreground mb-1">credits</p>
                <p className="text-lg font-semibold mb-4">{pack.label}</p>
                <Button
                  className="w-full" size="sm"
                  variant={pack.popular ? 'default' : 'outline'}
                  onClick={() => handleBuyCredits(pack)}
                  disabled={purchasingPack !== null}
                >
                  {purchasingPack === pack.credits
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : 'Buy Now'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto top-up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />Auto Top-Up
          </CardTitle>
          <CardDescription>Automatically purchase credits when your balance runs low</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Auto Top-Up</p>
              <p className="text-xs text-muted-foreground">Requires a saved payment method in the portal</p>
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
                  <label className="text-sm font-medium">Top-up when below</label>
                  <Select
                    value={String(autoTopUp.threshold)}
                    onValueChange={(v) => {
                      const updated = { ...autoTopUp, threshold: parseInt(v) }
                      setAutoTopUp(updated); saveAutoTopUp(updated)
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    value={String(autoTopUp.top_up_amount)}
                    onValueChange={(v) => {
                      const updated = { ...autoTopUp, top_up_amount: parseInt(v) }
                      setAutoTopUp(updated); saveAutoTopUp(updated)
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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

      {/* Purchase history */}
      {creditPurchases.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Credit Purchase History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {creditPurchases.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between py-3 ${i < creditPurchases.length - 1 ? 'border-b' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium">+{p.credits_purchased} credits</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(p.amount_paid)}</p>
                    <Badge variant={p.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                      {p.status}
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
