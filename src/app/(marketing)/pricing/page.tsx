'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
import { Check, Loader2 } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 videos per month',
      '720p quality',
      'Watermark included',
      'Basic AI voices',
      'Community support',
    ],
    priceIdMonthly: null,
    priceIdYearly: null,
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators',
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: [
      '30 videos per month',
      '1080p quality',
      'No watermark',
      'Premium AI voices',
      'Voice cloning',
      'Priority email support',
    ],
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    cta: 'Start Pro',
    href: null,
    highlighted: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'For teams & power users',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '100 videos per month',
      '4K quality',
      'White-label exports',
      'Custom AI avatars',
      'Team workspaces',
      'API access',
      'Dedicated support',
    ],
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID,
    priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID,
    cta: 'Start Agency',
    href: null,
    highlighted: false,
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleSubscribe(plan: (typeof PLANS)[number]) {
    if (plan.href) {
      window.location.href = plan.href
      return
    }

    const priceId = isYearly ? plan.priceIdYearly : plan.priceIdMonthly
    if (!priceId) {
      toast.error('This plan is not yet available. Please check back soon.')
      return
    }

    setLoadingPlan(plan.id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Likely not logged in — redirect to signup
        if (res.status === 401) {
          window.location.href = `/signup?plan=${plan.id}`
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      )
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Start free, upgrade when you&apos;re ready.
          </p>

          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
            <Label htmlFor="billing-toggle" className="text-xs sm:text-sm">
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label
              htmlFor="billing-toggle"
              className="text-xs sm:text-sm flex items-center gap-2"
            >
              Yearly
              <Badge variant="secondary" className="text-xs">
                Save ~20%
              </Badge>
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.highlighted
                  ? 'relative border-primary shadow-lg md:scale-105'
                  : ''
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-xs sm:text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      /{isYearly ? 'mo, billed yearly' : 'month'}
                    </span>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      /forever
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4 sm:pb-6">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full text-xs sm:text-sm h-9 sm:h-10"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include a 7-day money-back guarantee. No questions asked.{' '}
          <Link href="/terms" className="underline underline-offset-2">
            Terms apply.
          </Link>
        </p>
      </div>
    </div>
  )
}
