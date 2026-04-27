'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CreditCard, CheckCircle2, XCircle, Loader2, ExternalLink,
  Coins, RefreshCw, TrendingUp, Zap, Sparkles, Crown, ArrowUpRight,
} from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { Badge }     from '@/components/ui/badge'
import { Switch }    from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

type PlanType = 'free' | 'pro' | 'agency'

interface Profile       { id: string; plan: PlanType; credits: number; email: string; full_name?: string | null }
interface Subscription  { id: string; status: string; renews_at?: string | null; provider: string }
interface CreditPurchase{ id: string; credits_purchased: number; amount_paid: number; status: string; created_at: string }
interface AutoTopUp     { enabled: boolean; threshold: number; top_up_amount: number }

const CREDIT_PACKS = [
  { credits: 10, price: 900,  label: '$9',  pricePerCredit: '$0.90' },
  { credits: 25, price: 1900, label: '$19', pricePerCredit: '$0.76', popular: true },
  { credits: 50, price: 2900, label: '$29', pricePerCredit: '$0.58', badge: 'Best value' },
] as const

const PLAN_META: Record<PlanType, { label: string; color: string; icon: typeof Crown }> = {
  free:   { label: 'Free',   color: 'text-slate-600 bg-slate-100 dark:bg-slate-800',              icon: Zap },
  pro:    { label: 'Pro',    color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/50',              icon: Sparkles },
  agency: { label: 'Agency', color: 'text-violet-700 bg-violet-100 dark:bg-violet-900/50',        icon: Crown },
}

export default function BillingPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [isLoading,         setIsLoading]         = useState(true)
  const [isPortalLoading,   setIsPortalLoading]   = useState(false)
  const [isSavingAutoTopUp, setIsSavingAutoTopUp] = useState(false)
  const [purchasingPack,    setPurchasingPack]    = useState<number | null>(null)
  const [profile,           setProfile]           = useState<Profile | null>(null)
  const [subscription,      setSubscription]      = useState<Subscription | null>(null)
  const [creditPurchases,   setCreditPurchases]   = useState<CreditPurchase[]>([])
  const [autoTopUp,         setAutoTopUp]         = useState<AutoTopUp>({ enabled: false, threshold: 5, top_up_amount: 25 })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [{ data: p }, { data: s }, { data: pu }] = await Promise.all([
        supabase.from('profiles').select('id,plan,credits,email,full_name').eq('id', user.id).single(),
        supabase.from('payment_subscriptions').select('id,status,renews_at,provider').eq('user_id', user.id).in('status', ['active','trialing','paused']).order('created_at',{ascending:false}).limit(1).maybeSingle(),
        supabase.from('credit_purchases').select('id,credits_purchased,amount_paid,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(10),
      ])
      setProfile(p as Profile)
      setSubscription(s as Subscription | null)
      setCreditPurchases((pu ?? []) as CreditPurchase[])
    } catch { toast.error('Failed to load billing data') }
    finally { setIsLoading(false) }
  }, [supabase, router])

  useEffect(() => {
    loadData()
    fetch('/api/billing/auto-top-up').then(r => r.ok ? r.json() : null).then(d => { if (d) setAutoTopUp(d as AutoTopUp) }).catch(() => {})
  }, [loadData])

  async function handlePortal() {
    setIsPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ returnUrl: `${window.location.origin}/dashboard/billing` }) })
      const d   = await res.json() as { url?:string; error?:string }
      if (!res.ok) throw new Error(d.error)
      window.location.href = d.url!
    } catch { toast.error('Failed to open billing portal') }
    finally { setIsPortalLoading(false) }
  }

  async function saveAutoTopUp(s: AutoTopUp) {
    setIsSavingAutoTopUp(true)
    try { await fetch('/api/billing/auto-top-up', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(s) }); toast.success('Auto top-up saved') }
    catch { toast.error('Failed to save') }
    finally { setIsSavingAutoTopUp(false) }
  }

  async function buyCredits(pack: typeof CREDIT_PACKS[number]) {
    setPurchasingPack(pack.credits)
    try {
      const res = await fetch('/api/stripe/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mode:'payment', credits: pack.credits, successUrl:`${window.location.origin}/dashboard?credits=purchased`, cancelUrl:`${window.location.origin}/dashboard/billing` }) })
      const d   = await res.json() as { url?:string; error?:string }
      if (!res.ok) throw new Error(d.error)
      if (d.url) window.location.href = d.url
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Purchase failed') }
    finally { setPurchasingPack(null) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center animate-pulse">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-slate-500">Loading billing…</span>
      </div>
    </div>
  )

  const plan      = (profile?.plan ?? 'free') as PlanType
  const planMeta  = PLAN_META[plan]
  const PlanIcon  = planMeta.icon
  const isActive  = subscription?.status === 'active' || subscription?.status === 'trialing'
  const credits   = profile?.credits ?? 0
  const creditPct = Math.min(100, (credits / 30) * 100)

  return (
    <div className="space-y-6 max-w-4xl pb-8 animate-fade-up">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing &amp; Subscription</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your plan, credits, and payment methods</p>
      </div>

      {/* ── Overview cards ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">

        {/* Plan */}
        <div className="card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Plan</span>
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1', planMeta.color)}>
              <PlanIcon className="w-3 h-3" />{planMeta.label}
            </span>
          </div>
          <p className="text-3xl font-extrabold capitalize tracking-tight">{plan}</p>
          <p className="text-xs text-slate-500 mt-1">{plan === 'free' ? 'Upgrade to unlock more' : 'Premium plan active'}</p>
        </div>

        {/* Credits */}
        <div className="card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Credits</span>
          </div>
          <p className="text-3xl font-extrabold tabular-nums">{credits}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full progress-shine transition-all duration-700" style={{ width: `${creditPct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{credits} of 30 remaining</p>
        </div>

        {/* Status */}
        <div className="card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</span>
          </div>
          {isActive ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Active</span>
              </div>
              {subscription?.renews_at && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Renews {new Date(subscription.renews_at).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' })}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-slate-500">No subscription</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Upgrade to a paid plan</p>
            </>
          )}
        </div>
      </div>

      {/* ── Manage billing ──────────────────────────────────── */}
      <div className="card-premium rounded-2xl p-6">
        <h3 className="font-semibold mb-1">Manage Billing</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Update payment method, view invoices, or change your plan</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePortal}
            disabled={isPortalLoading}
            className="btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-md shadow-violet-500/20"
          >
            {isPortalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            Customer Portal
          </Button>
          <Button variant="outline" onClick={() => router.push('/pricing')} className="hover-lift">
            <ExternalLink className="mr-2 h-4 w-4" />
            {plan === 'free' ? 'Upgrade Plan' : 'View Plans'}
          </Button>
        </div>
      </div>

      {/* ── Credit packs ────────────────────────────────────── */}
      <div className="card-premium rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-semibold">Buy Credits</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">One-time credit packs — never expire</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={cn(
                'relative rounded-xl border p-5 text-center transition-all duration-200',
                pack.popular
                  ? 'border-violet-400 dark:border-violet-600 bg-violet-50/60 dark:bg-violet-950/20 shadow-md shadow-violet-500/10 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
              )}
            >
              {(pack.popular || 'badge' in pack) && (
                <span className={cn(
                  'absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                  pack.popular ? 'bg-violet-600 text-white' : 'bg-emerald-600 text-white'
                )}>
                  {'badge' in pack ? pack.badge : 'Most popular'}
                </span>
              )}
              <p className="text-3xl font-extrabold mt-2 tabular-nums">{pack.credits}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">credits</p>
              <p className="text-xl font-bold mb-1">{pack.label}</p>
              <p className="text-xs text-slate-400 mb-4">{pack.pricePerCredit} each</p>
              <Button
                className={cn(
                  'w-full btn-shine',
                  pack.popular
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-sm'
                    : ''
                )}
                variant={pack.popular ? 'default' : 'outline'}
                size="sm"
                onClick={() => buyCredits(pack)}
                disabled={purchasingPack !== null}
              >
                {purchasingPack === pack.credits
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Coins className="mr-1.5 h-3.5 w-3.5" />Buy now</>}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Auto top-up ─────────────────────────────────────── */}
      <div className="card-premium rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Auto Top-Up</h3>
          </div>
          <Switch
            checked={autoTopUp.enabled}
            disabled={isSavingAutoTopUp}
            onCheckedChange={(v) => { const u = { ...autoTopUp, enabled: v }; setAutoTopUp(u); saveAutoTopUp(u) }}
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Automatically buy credits when your balance runs low
        </p>

        {autoTopUp.enabled && (
          <>
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Top-up when below</label>
                <Select value={String(autoTopUp.threshold)} onValueChange={(v) => { const u = { ...autoTopUp, threshold: parseInt(v) }; setAutoTopUp(u); saveAutoTopUp(u) }}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 credits</SelectItem>
                    <SelectItem value="5">5 credits</SelectItem>
                    <SelectItem value="10">10 credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Purchase amount</label>
                <Select value={String(autoTopUp.top_up_amount)} onValueChange={(v) => { const u = { ...autoTopUp, top_up_amount: parseInt(v) }; setAutoTopUp(u); saveAutoTopUp(u) }}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
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
      </div>

      {/* ── Purchase history ────────────────────────────────── */}
      {creditPurchases.length > 0 && (
        <div className="card-premium rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Credit Purchase History</h3>
          <div className="space-y-0">
            {creditPurchases.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  'flex items-center justify-between py-3 group',
                  i < creditPurchases.length - 1 ? 'border-b border-slate-200/60 dark:border-slate-700/60' : ''
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">+{p.credits_purchased} credits</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(p.created_at).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(p.amount_paid)}</p>
                  <Badge
                    variant={p.status === 'completed' ? 'default' : 'outline'}
                    className={cn('text-[10px] mt-0.5', p.status === 'completed' ? 'bg-emerald-600 text-white' : '')}
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
