'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import {
  CreditCard, CheckCircle2, XCircle, Loader2,
  ExternalLink, Coins, RefreshCw, TrendingUp, Zap, FileText,
  Crown, Sparkles,
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
import { cn } from '@/lib/utils'

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

interface BillingTransaction {
  id: string
  user_id: string
  amount: number | null
  currency: string
  status: string
  payment_method: string
  payment_charge_id: string
  created_at: string
  user_email?: string
}

interface AutoTopUpState {
  enabled: boolean
  threshold: number
  top_up_amount: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface CreditPack {
  credits: number
  price: number
  label: string
  popular?: true
}

const CREDIT_PACKS: CreditPack[] = [
  { credits: 10, price: 900,  label: '$9'  },
  { credits: 25, price: 1900, label: '$19', popular: true },
  { credits: 50, price: 2900, label: '$29' },
]

const PLAN_BADGE: Record<PlanType, { label: string; className: string }> = {
  free:   { label: 'Free',   className: '' },
  pro:    { label: 'Pro',    className: 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(139,92,246,0.2)]' },
  agency: { label: 'Agency', className: 'bg-violet-600 text-white dark:bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.2)]' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading,         setIsLoading]         = useState(true)
  const [isPortalLoading,   setIsPortalLoading]   = useState(false)
  const [isSavingAutoTopUp, setIsSavingAutoTopUp] = useState(false)
  const [purchasingPack,    setPurchasingPack]    = useState<number | null>(null)
  const [profile,           setProfile]           = useState<Profile | null>(null)
  const [subscription,      setSubscription]      = useState<PaymentSubscription | null>(null)
  const [creditPurchases,   setCreditPurchases]   = useState<CreditPurchase[]>([])
  const [billingHistory,    setBillingHistory]    = useState<BillingTransaction[]>([])
  const [isLoadingHistory,  setIsLoadingHistory]  = useState(false)
  const [autoTopUp,         setAutoTopUp]         = useState<AutoTopUpState>({
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

  const loadBillingHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const res = await fetch('/api/billing/history')
      if (res.ok) {
        const data = await res.json() as { transactions: BillingTransaction[] }
        setBillingHistory(data.transactions)
      }
    } catch { /* non-fatal */ }
    finally { setIsLoadingHistory(false) }
  }, [])

  useEffect(() => {
    loadBillingData()
    loadAutoTopUpSettings()
    loadBillingHistory()
  }, [loadBillingData, loadAutoTopUpSettings, loadBillingHistory])

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading billing data...</span>
      </div>
    )
  }

  const plan     = (profile?.plan ?? 'free') as PlanType
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const badge    = PLAN_BADGE[plan]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing &amp; Subscription</h2>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Manage your plan, credits, and payment methods
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 stagger-children">
        {/* Current Plan */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none transition-all duration-300',
            plan === 'pro' ? 'from-primary/[0.04] group-hover:from-primary/[0.06]' : plan === 'agency' ? 'from-violet-500/[0.04] group-hover:from-violet-500/[0.06]' : ''
          )} />
          <div className="relative flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-muted-foreground">Current Plan</span>
            {plan !== 'free' && (
              <div className={cn('p-1.5 rounded-lg', plan === 'pro' ? 'bg-primary/10' : 'bg-violet-500/10')}>
                <Crown className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>
          <p className="relative text-xl sm:text-2xl font-bold tracking-tight capitalize stat-number">{plan}</p>
          <Badge
            className={cn('mt-2 relative', badge.className)}
            variant={plan === 'free' ? 'outline' : 'default'}
          >
            {badge.label}
          </Badge>
        </div>

        {/* Available Credits */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/[0.03] transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Coins className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Available Credits</span>
          </div>
          <p className="relative text-xl sm:text-2xl font-bold tracking-tight tabular-nums stat-number">
            {profile?.credits ?? 0}
          </p>
        </div>

        {/* Subscription Status */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/[0.03] transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
          </div>
          {isActive ? (
            <div className="relative flex flex-wrap items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">Active</span>
              {subscription?.renews_at && (
                <span className="text-xs text-muted-foreground">
                  renews {new Date(subscription.renews_at).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <div className="relative flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground">No active subscription</span>
            </div>
          )}
        </div>
      </div>

      {/* Manage Billing */}
      <Card className="card-glow rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base border-l-2 border-primary pl-3">Manage Billing</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Update payment method, view invoices, or change your plan
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button
            onClick={handleManageBilling}
            disabled={isPortalLoading}
            className="h-11 sm:h-12 w-full sm:w-auto rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {isPortalLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <CreditCard className="mr-2 h-4 w-4" />}
            Customer Portal
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/pricing')}
            className="h-11 sm:h-12 w-full sm:w-auto rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {plan === 'free' ? 'Upgrade Plan' : 'View Plans'}
          </Button>
        </CardContent>
      </Card>

      {/* Credit Packs */}
      <Card className="card-glow rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 border-l-2 border-primary pl-3">
            <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />Buy Credits
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            One-time credit packs — never expire
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className={cn(
                  'relative rounded-2xl border p-5 sm:p-6 text-center transition-all duration-200 cursor-default',
                  'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10',
                  pack.popular
                    ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent shadow-[0_0_30px_rgba(139,92,246,0.12)]'
                    : 'border-border/60 hover:border-primary/30 bg-card'
                )}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                      <Sparkles className="h-3 w-3" />
                      Best Value
                    </span>
                  </div>
                )}
                <p className="mt-3 text-4xl font-bold stat-number">{pack.credits}</p>
                <p className="text-sm text-muted-foreground">credits</p>
                <p className="mt-1 text-2xl font-semibold">{pack.label}</p>
                <Button
                  className={cn(
                    'mt-5 w-full rounded-xl',
                    pack.popular && 'gradient-brand shadow-lg shadow-primary/20'
                  )}
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

      {/* Auto Top-Up */}
      <Card className="card-glow rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 border-l-2 border-primary pl-3">
            <RefreshCw className="h-4 w-4" />Auto Top-Up
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Automatically purchase credits when your balance runs low
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium">Enable Auto Top-Up</p>
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
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <AnimatePresence>
            {autoTopUp.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Top-up when below</label>
                    <Select
                      value={String(autoTopUp.threshold)}
                      onValueChange={(v) => {
                        const updated = { ...autoTopUp, threshold: parseInt(v) }
                        setAutoTopUp(updated); saveAutoTopUp(updated)
                      }}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary/30">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 credits</SelectItem>
                        <SelectItem value="5">5 credits</SelectItem>
                        <SelectItem value="10">10 credits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Purchase amount</label>
                    <Select
                      value={String(autoTopUp.top_up_amount)}
                      onValueChange={(v) => {
                        const updated = { ...autoTopUp, top_up_amount: parseInt(v) }
                        setAutoTopUp(updated); saveAutoTopUp(updated)
                      }}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary/30">
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 credits ($9)</SelectItem>
                        <SelectItem value="25">25 credits ($19)</SelectItem>
                        <SelectItem value="50">50 credits ($29)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Credit Purchase History */}
      {creditPurchases.length > 0 && (
        <Card className="card-glow rounded-2xl">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base border-l-2 border-primary pl-3">Credit Purchase History</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-0">
              {creditPurchases.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3',
                    i % 2 === 0 ? 'bg-muted/10' : '',
                    'px-3 rounded-lg',
                    i < creditPurchases.length - 1 ? 'border-b border-border/50' : ''
                  )}
                >
                  <div>
                    <p className="text-xs sm:text-sm font-medium tabular-nums font-mono">
                      +{p.credits_purchased} credits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm font-bold tabular-nums font-mono">
                      {formatPrice(p.amount_paid)}
                    </p>
                    <Badge
                      variant={p.status === 'completed' ? 'default' : 'outline'}
                      className={cn(
                        'text-xs',
                        p.status === 'completed' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      )}
                    >
                      {p.status === 'completed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction & Invoice History */}
      <Card className="card-glow rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 border-l-2 border-primary pl-3">
            <FileText className="h-4 w-4" />Transaction & Invoice History
          </CardTitle>
          {billingHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/stripe/portal'}
              className="h-9 text-xs rounded-lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Full Invoice Portal</span>
              <span className="sm:hidden">Invoices</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="empty-state py-6">
              <div className="empty-state-icon">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="empty-state-title">No transaction history yet</p>
              <p className="empty-state-description">
                Your payment transactions will appear here once you make a purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {billingHistory.map((t, i) => (
                <div
                  key={t.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-3 rounded-lg',
                    i % 2 === 0 ? 'bg-muted/10' : '',
                    i < billingHistory.length - 1 ? 'border-b border-border/50' : ''
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      t.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-muted'
                    )}>
                      <FileText className={cn(
                        'h-4 w-4',
                        t.status === 'completed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      )} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold tabular-nums font-mono">
                        {t.amount ? `$${(t.amount / 100).toFixed(2)}` : 'Subscription'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })} · {t.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    {t.payment_charge_id && (
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[100px] sm:max-w-none">
                        {t.payment_charge_id.slice(0, 12)}...
                      </p>
                    )}
                    <Badge
                      variant={t.status === 'completed' ? 'default' : 'outline'}
                      className={cn(
                        'text-xs',
                        t.status === 'completed' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      )}
                    >
                      {t.status === 'completed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
