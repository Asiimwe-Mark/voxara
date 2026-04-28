import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, Video, Wand2, Mic, Share2, BarChart3,
  CheckCircle2, ArrowRight, Play, Zap, Globe, Lock,
  Shield, TrendingUp, Cpu, DollarSign, Trophy, Star,
  ChevronRight,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Script Generation',
    desc: 'Google Gemini powers instant, platform-optimized scripts from any topic — with tone and length controls.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
  {
    icon: Mic,
    title: 'AI Voice Cloning',
    desc: 'ElevenLabs voice tech. Clone your voice or choose from 500+ natural voices in 90+ languages.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Video,
    title: 'Photorealistic Avatars',
    desc: 'HeyGen, D-ID & Synthesia. Digital presenters with facial expressions, gestures, and perfect lip-sync.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: Share2,
    title: 'One-Click Publishing',
    desc: 'Auto-publish to YouTube, TikTok, Instagram with scheduling and built-in SEO metadata.',
    color: 'from-orange-500 to-rose-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Track views, retention, CTR and engagement across every platform in one unified dashboard.',
    color: 'from-pink-500 to-fuchsia-600',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
  },
  {
    icon: Globe,
    title: 'Template Marketplace',
    desc: 'Buy and sell proven templates. Create once, earn infinitely from your best-performing formats.',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    credits: '1 credit',
    features: ['1 AI videos/month', 'Basic voices', '720p render', 'Community support'],
    cta: 'Get started free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    credits: '30 credits',
    features: ['30 AI videos/month', '500+ voices', '4K render', 'AI avatars', 'Analytics', 'Priority support'],
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/month',
    credits: '100 credits',
    features: ['100 AI videos/month', 'Voice cloning', '4K render', 'All avatars', 'API access', 'Team seats', 'Dedicated support'],
    cta: 'Start Agency trial',
    href: '/signup?plan=agency',
    highlight: false,
  },
]

const STATS = [
  { value: '50K+', label: 'Videos Created' },
  { value: '12K+', label: 'Creators' },
  { value: '90+',  label: 'Languages' },
  { value: '4.9★', label: 'Avg Rating' },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Content Creator · 180K subs',
    text: 'I went from posting once a week to 5x daily. Voxara does in 3 minutes what took me 6 hours.',
    avatar: 'SC',
    color: 'bg-violet-500',
  },
  {
    name: 'Marcus Williams',
    role: 'Agency Owner',
    text: 'We manage 40 client channels with a 3-person team. Voxara is literally our entire production pipeline.',
    avatar: 'MW',
    color: 'bg-blue-500',
  },
  {
    name: 'Priya Sharma',
    role: 'EdTech Founder',
    text: 'Our course completion rate went up 34% since switching to Voxara videos. The avatars are indistinguishable.',
    avatar: 'PS',
    color: 'bg-emerald-500',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">voxara</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
            <Link href="#pricing"  className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">Reviews</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-md" asChild>
              <Link href="/signup">Start free <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Aurora background */}
        <div className="aurora" />
        {/* Dot pattern */}
        <div className="absolute inset-0 pattern-dots opacity-60" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Powered by Google Gemini · ElevenLabs · HeyGen
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-75 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Create viral videos{' '}
            <span className="gradient-text-hero">with AI</span>
            <br />no camera needed
          </h1>

          <p className="animate-fade-up delay-150 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Script → Voice → Avatar → Published in under 3 minutes.
            The complete AI video production stack for creators and agencies.
          </p>

          <div className="animate-fade-up delay-225 flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Button size="lg" className="btn-shine h-12 px-8 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/25 text-base" asChild>
              <Link href="/signup">
                <Sparkles className="mr-2 w-4 h-4" />
                Start creating free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base hover-lift" asChild>
              <Link href="#features">
                <Play className="mr-2 w-4 h-4" />
                See how it works
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up delay-300 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className={`text-center delay-${75 * i}`}>
                <div className="text-2xl sm:text-3xl font-bold gradient-text-hero tabular-nums">{s.value}</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero card preview */}
        <div className="animate-fade-up delay-375 relative max-w-4xl mx-auto mt-16">
          <div className="gradient-border rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20">
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-slate-500 text-sm font-mono">voxara studio</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {['Script', 'Voice', 'Publish'].map((step, i) => (
                  <div key={step} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-violet-600' : i === 1 ? 'bg-blue-600' : 'bg-emerald-600'}`}>{i + 1}</div>
                      <span className="text-white text-sm font-medium">{step}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-700 rounded-full" />
                      <div className="h-2 bg-slate-700 rounded-full w-4/5" />
                      <div className="h-2 bg-slate-700 rounded-full w-3/5" />
                    </div>
                    {i === 2 && (
                      <div className="mt-3 flex gap-1.5">
                        {['YT','TK','IG'].map(p => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-400 font-mono">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Video ready in 2m 34s · Published to 3 platforms</span>
              </div>
            </div>
          </div>
          {/* Floating badges */}
          <div className="absolute -top-4 -right-4 sm:-right-8 animate-float bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-ring" />
            <span className="text-sm font-medium">3 videos published today</span>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="relative py-24 px-4 sm:px-6 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="absolute inset-0 pattern-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">
              Everything you need
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              The complete AI video stack
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Every tool from script to published video, powered by the world&apos;s best AI models.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`card-premium rounded-2xl p-6 group cursor-default animate-fade-up delay-${75 * (i % 4)}`}>
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Loved by creators
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Real results, real creators
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`card-premium rounded-2xl p-6 animate-fade-up delay-${150 * i}`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="relative py-24 px-4 sm:px-6 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="absolute inset-0 pattern-dots opacity-40" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              Simple pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Start free, scale up</h2>
            <p className="text-slate-600 dark:text-slate-400">No contracts. Cancel anytime.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 animate-fade-up delay-${150 * i} ${
                  plan.highlight
                    ? 'gradient-border bg-white dark:bg-slate-900 shadow-2xl shadow-violet-500/20 scale-[1.02]'
                    : 'card-premium'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      Most popular
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <div className="font-semibold text-lg">{plan.name}</div>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-slate-500 pb-1">{plan.period}</span>
                  </div>
                  <div className="text-sm text-violet-600 dark:text-violet-400 font-medium mt-1">{plan.credits}</div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full btn-shine ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/25'
                      : ''
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield,    label: 'SOC 2 compliant',    sub: 'Enterprise security' },
              { icon: Lock,      label: 'End-to-end encrypted', sub: 'Your data stays yours' },
              { icon: TrendingUp,label: '99.9% uptime SLA',   sub: 'Production-grade infra' },
              { icon: Trophy,    label: '4.9/5 rating',       sub: '2,400+ verified reviews' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="aurora" />
        <div className="absolute inset-0 pattern-dots opacity-50" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Your first video is{' '}
            <span className="gradient-text-hero">3 minutes away</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
            Join 12,000+ creators. No camera, no crew, no editing skills required.
          </p>
          <Button size="lg" className="btn-shine h-14 px-10 text-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-xl shadow-violet-500/30" asChild>
            <Link href="/signup">
              <Sparkles className="mr-2 w-5 h-5" />
              Create your first video free
            </Link>
          </Button>
          <p className="mt-4 text-sm text-slate-500">No credit card required · 3 free videos included</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold">voxara</span>
              <span className="text-slate-400 text-sm ml-2">© 2025</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <Link href="/legal/terms"   className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="/legal/dpa"     className="hover:text-slate-900 dark:hover:text-white transition-colors">DPA</Link>
              <Link href="/legal/aup"     className="hover:text-slate-900 dark:hover:text-white transition-colors">AUP</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
