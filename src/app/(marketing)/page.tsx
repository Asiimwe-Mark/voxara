'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ShieldCheck, Film, Users, X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
]

const featureList = [
  {
    title: 'AI script & storyboard',
    description:
      'Generate polished, brand-safe scripts and storyboards with one click, then deploy them to video instantly.',
    icon: Sparkles,
    accent: 'from-primary to-sky-400',
  },
  {
    title: 'Studio-quality voices',
    description:
      'Choose from 500+ premium voices, clone your own voice, and localise videos in 90+ languages.',
    icon: ShieldCheck,
    accent: 'from-emerald-500 to-cyan-400',
  },
  {
    title: 'Premium visual templates',
    description:
      'Access high-converting templates, animated scenes, and adaptive layouts built for modern brands.',
    icon: Film,
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Team workflow & approval',
    description:
      'Collaborate across teams with shared projects, comments, review flows, and usage controls.',
    icon: Users,
    accent: 'from-amber-500 to-orange-400',
  },
]

const stats = [
  { value: '50K+', label: 'Videos Created' },
  { value: '500M+', label: 'Views Delivered' },
  { value: '95%', label: 'Customer Satisfaction' },
  { value: '24/7', label: 'Global Support' },
]

const plans = [
  {
    name: 'Free',
    price: '0',
    description:
      'Try Voxara with essential video credits and watermark-free starter exports.',
    features: [
      '1 video / month',
      '720p HD',
      'Starter voice library',
      'Community support',
    ],
    button: 'Get started',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: '29',
    description:
      'For creators and small teams who need more output, premium voices, and advanced publishing.',
    features: [
      '30 videos / month',
      '1080p',
      'Voice cloning',
      'API access',
      'Priority render',
    ],
    button: 'Start Pro',
    href: '/signup?plan=pro',
    featured: true,
  },
  {
    name: 'Agency',
    price: '99',
    description:
      'Enterprise-ready video production for agencies, brands, and growth teams.',
    features: [
      '100+ videos / month',
      '4K export',
      'White-label',
      'Team seats',
      'Dedicated support',
    ],
    button: 'Start Agency',
    href: '/signup?plan=agency',
    featured: false,
  },
]

const faqs = [
  {
    question: 'How fast can I publish a video?',
    answer:
      'Most projects are ready in under 15 minutes with automated voice, captions, and stock footage assembled for your selected format.',
  },
  {
    question: 'Can I use generated videos commercially?',
    answer:
      'Yes — paid plans include commercial usage rights. Free plan videos include a small watermark for evaluation purposes.',
  },
  {
    question: 'Do you offer API integration?',
    answer:
      'Pro and Agency include API access for production workflows, custom automation, and branded publishing pipelines.',
  },
  {
    question: 'What support is included?',
    answer:
      'Pro gets priority support, and Agency gets a dedicated success contact plus onboarding resources.',
  },
]

const testimonials = [
  {
    quote:
      'Voxara gave our team a reliable video engine for demand-gen campaigns. We now publish twice as many ads with higher engagement and zero production bottlenecks.',
    name: 'Maya R.',
    role: 'CMO, Growth House',
  },
  {
    quote:
      'The quality and speed is outstanding. Every campaign feels polished, and the platform keeps our creative process lean and scalable.',
    name: 'Jared K.',
    role: 'Founder, ScaleStudio',
  },
  {
    quote:
      'From briefing to launch in minutes — Voxara removes the friction we used to have with freelance production, without sacrificing brand quality.',
    name: 'Priya S.',
    role: 'Head of Creative, BrightTech',
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">voxara</p>
              <p className="text-xs text-muted-foreground">AI video studio</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Start free</Link>
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {menuOpen && (
          <div className="border-t border-border/70 bg-background/95 px-4 py-4 sm:px-6 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl px-3 py-2 transition-colors hover:bg-primary/10 hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="rounded-2xl px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Button asChild className="w-full">
                <Link href="/signup">Start free</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary shadow-sm shadow-primary/10">
              <Sparkles className="h-4 w-4" />
              <span>Built for high-growth teams and modern brands</span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                Launch premium AI videos with speed, scale, and standout
                quality.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Voxara transforms your ideas into studio-grade videos with
                script writing, voice synthesis, avatar animation, and
                publishing workflows — all in one intelligent platform.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="min-w-[12rem]">
                <Link href="/signup">Start free</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="min-w-[12rem]"
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-primary">
                  Fast results
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  From brief to final video in under 15 minutes.
                </p>
              </div>
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-primary">
                  Creative control
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  Custom voice, brand palette, and story style for every
                  project.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%)]" />
            <div className="relative grid gap-6 rounded-[28px] border border-white/5 bg-slate-950/75 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <span>Live preview</span>
                  <Badge className="rounded-full px-3 py-1 text-[11px]">
                    New
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    AI Video Project
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Social launch ad
                  </h2>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Scene 3 of 8</span>
                  <span>2:14</span>
                </div>
                <div className="mt-4 h-48 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/90 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-white">Voice</p>
                  <p className="mt-2">Pro Voice · Emma</p>
                </div>
                <div className="rounded-3xl bg-slate-950/90 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-white">Format</p>
                  <p className="mt-2">16:9 / Social-ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-[32px] border border-border/80 bg-card p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-background/80 p-6 text-center"
            >
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        <section id="features" className="py-16">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Badge className="mx-auto rounded-full px-4 py-2 text-sm uppercase tracking-[0.26em] text-primary/90">
              Enterprise AI video
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built for creators, marketers, and enterprise teams.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Everything your team needs to plan, produce, and publish
              high-impact video campaigns without creative bottlenecks.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featureList.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="overflow-hidden border-transparent bg-gradient-to-br from-slate-950/95 to-slate-900/95 p-6 shadow-lg shadow-slate-950/5"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-primary/20`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section id="use-cases" className="py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">
                Use cases
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Scale every campaign with confident storytelling.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Whether you’re launching a product, building brand awareness, or
                running performance ads, Voxara automates the video workflow
                with consistent quality.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Product launches',
                'Performance ads',
                'Sales enablement',
                'Social growth',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-border/80 bg-card p-6"
                >
                  <p className="text-sm font-medium text-foreground">{item}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Turn your brief into a ready-to-publish video without
                    creative overhead.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-16">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Badge className="mx-auto rounded-full px-4 py-2 text-sm uppercase tracking-[0.26em] text-primary/90">
              Testimonials
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Trusted by high-growth marketing teams.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Hear from brands that scaled video production with premium speed,
              voice quality, and consistent creative standards.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card
                key={item.name}
                className="rounded-[28px] border border-border/80 bg-card p-6 shadow-lg shadow-slate-950/10"
              >
                <p className="text-sm leading-7 text-muted-foreground">
                  “{item.quote}”
                </p>
                <div className="mt-6 space-y-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="rounded-[32px] border border-border/80 bg-card p-8 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-primary">
                  Trusted by teams
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  Enterprise-grade creatives with a polished production
                  pipeline.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  Build a consistent brand voice and accelerate production
                  across every channel — from ads to explainers.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Google Gemini', 'ElevenLabs', 'HeyGen', 'Mux'].map(
                  (logo) => (
                    <div
                      key={logo}
                      className="rounded-3xl border border-border/80 bg-background/80 p-4 text-sm font-semibold text-foreground"
                    >
                      {logo}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Badge className="mx-auto rounded-full px-4 py-2 text-sm uppercase tracking-[0.26em] text-primary/90">
              Pricing
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Simple plans with enterprise-ready scale.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Start with a free tier, upgrade when you need advanced automation,
              or choose Agency for full team collaboration and white-label
              workflows.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`rounded-[32px] border p-6 shadow-lg ${plan.featured ? 'border-primary/30 bg-primary/5' : 'border-border/80 bg-card'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                      {plan.name}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  {plan.featured && (
                    <Badge className="rounded-full px-3 py-1 text-[11px]">
                      Most popular
                    </Badge>
                  )}
                </div>
                <div className="mt-8 space-y-2">
                  <p className="text-5xl font-semibold tracking-tight text-foreground">
                    ${plan.price}
                  </p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-8 w-full">
                  <Link href={plan.href}>{plan.button}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <section id="faq" className="py-16">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Badge className="mx-auto rounded-full px-4 py-2 text-sm uppercase tracking-[0.26em] text-primary/90">
              FAQ
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Everything you need to know before launch.
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="overflow-hidden rounded-3xl border border-border/80 bg-card p-6"
              >
                <summary className="cursor-pointer text-lg font-semibold text-foreground">
                  {item.question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
