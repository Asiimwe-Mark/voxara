'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check, Loader2, Zap, Users } from 'lucide-react'
import { IconYoutube, IconInstagram, IconFacebook, IconXTwitter, IconTiktok } from '@/lib/icons'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try Voxara with no credit card',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 video per month',
      'Earn up to 5 extra credits by sharing',
      '+1 credit per friend you refer',
      '720p quality',
      'Voxara watermark',
      'Edge AI voices (100+ languages)',
      'Community support',
    ],
    priceIdMonthly: null,
    priceIdYearly: null,
    cta: 'Get Started Free',
    href: '/signup',
    highlighted: false,
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators',
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: [
      '30 videos per month',
      '1080p quality',
      'No watermark',
      'Premium ElevenLabs voices',
      'Voice cloning',
      'Adaptive Mux streaming',
      'Priority email support',
    ],
    priceIdMonthly: null,
    priceIdYearly: null,
    cta: 'Start Pro',
    href: null,
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'For teams & power users',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      '100 videos per month',
      '4K quality',
      'White-label exports',
      'Custom AI avatars',
      'Team workspaces',
      'API access',
      'Dedicated support',
    ],
    priceIdMonthly: null,
    priceIdYearly: null,
    cta: 'Start Agency',
    href: null,
    highlighted: false,
    badge: null,
  },
]

const EARN_ITEMS = [
  { icon: IconTiktok,   label: 'Share on TikTok',          credits: '+1 credit' },
  { icon: IconInstagram,label: 'Share on Instagram',        credits: '+1 credit' },
  { icon: IconYoutube,  label: 'Share on YouTube',          credits: '+2 credits' },
  { icon: IconFacebook, label: 'Share on Facebook',         credits: '+1 credit' },
  { icon: IconXTwitter, label: 'Share on X / Twitter',      credits: '+1 credit' },
  { icon: Users,        label: 'Refer a friend who signs up',credits: '+3 credits' },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleSubscribe(plan: (typeof PLANS)[number]) {
    if (plan.href) {
      window.location.href = plan.href
      return
    }

    setLoadingPlan(plan.id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.id,
          mode: 'subscription',
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/signup?plan=${plan.id}`
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Free users can earn up to 6 credits/month — just by sharing
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Start free. Earn extra credits by sharing your videos.
            Upgrade when you need more.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Label htmlFor="billing-toggle" className="text-sm">Monthly</Label>
            <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
            <Label htmlFor="billing-toggle" className="text-sm flex items-center gap-2">
              Yearly
              <Badge variant="secondary" className="text-xs">Save ~20%</Badge>
            </Label>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={plan.highlighted ? 'relative border-primary shadow-lg md:scale-105' : ''}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-xs">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground text-sm">
                      /{isYearly ? 'mo, billed yearly' : 'month'}
                    </span>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <span className="text-muted-foreground text-sm">/forever</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting...</>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Free tier earning explainer */}
        <div className="max-w-2xl mx-auto mt-14">
          <h2 className="text-center text-lg font-semibold mb-2">
            How free users earn extra credits
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Share your AI videos and invite friends — you earn credits, we get visibility. Win-win.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EARN_ITEMS.map(({ icon: Icon, label, credits }) => (
              <div
                key={label}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </div>
                <Badge variant="secondary" className="text-xs text-green-700 bg-green-50">
                  {credits}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Monthly cap: 5 sharing credits + unlimited referral credits
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All paid plans include a 7-day money-back guarantee.{' '}
          <Link href="/legal/terms" className="underline underline-offset-2">Terms apply.</Link>
        </p>
      </div>
    </div>
  )
}
