import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Video,
  Wand2,
  Mic,
  Share2,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Play,
  Zap,
  Globe,
  Lock,
  Users,
  Zap as ZapIcon,
  Shield,
  Clock,
  TrendingUp,
  Code,
  Layers,
  Cpu,
  Lightbulb,
  DollarSign,
  Trophy,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Script Generation',
    desc: 'Powered by Google Gemini. Generate engaging, platform-optimized scripts from any topic in seconds with tone and length customization.',
  },
  {
    icon: Mic,
    title: 'AI Voice Cloning',
    desc: 'ElevenLabs voice technology. Clone your voice or choose from 500+ natural-sounding voices in 90+ languages.',
  },
  {
    icon: Video,
    title: 'AI Avatars',
    desc: 'HeyGen, D-ID & Synthesia. Create photorealistic digital avatars that speak, with facial expressions and gestures.',
  },
  {
    icon: Share2,
    title: 'One-Click Publishing',
    desc: 'Auto-publish to YouTube, TikTok, Instagram with scheduling. Built-in metadata optimization and SEO tags.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Deep platform analytics. Track views, retention, engagement, CTR across all publishing channels in one dashboard.',
  },
  {
    icon: Globe,
    title: 'Template Marketplace',
    desc: 'Buy and sell templates. Create once, monetize infinitely. Earn from your best-performing video formats.',
  },
]

const STATS = [
  { number: '50K+', label: 'Videos Created' },
  { number: '500M+', label: 'Total Views' },
  { number: '95%', label: 'User Satisfaction' },
  { number: '24/7', label: 'Support' },
]

const USE_CASES = [
  {
    icon: TrendingUp,
    title: 'Content Creators',
    desc: 'Scale your channel with daily uploads without filming. Maintain consistency across platforms.',
  },
  {
    icon: Lightbulb,
    title: 'Marketing Agencies',
    desc: 'Create client video ads in hours instead of weeks. White-label your services and increase revenue.',
  },
  {
    icon: DollarSign,
    title: 'E-Commerce Brands',
    desc: 'Generate product demo videos, testimonials, and marketing content at scale without videographers.',
  },
  {
    icon: Users,
    title: 'Educators',
    desc: 'Turn courses into engaging video lectures with your personal avatar. Increase course completion rates.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: 0,
    credits: 3,
    features: [
      '3 videos/month',
      '720p quality',
      'Watermark',
      'Basic voices',
      'Email support',
      'Community access',
    ],
    cta: 'Start Free',
    href: '/signup',
    highlighted: false,
    description: 'Perfect for trying out the platform',
  },
  {
    name: 'Pro',
    price: 29,
    credits: 30,
    features: [
      '30 videos/month',
      '1080p quality',
      'No watermark',
      'Voice cloning',
      'All avatars',
      'Priority support',
      'Scheduling',
      'Basic API',
    ],
    cta: 'Start Pro',
    href: '/signup?plan=pro',
    highlighted: true,
    description: 'Most popular for content creators',
  },
  {
    name: 'Agency',
    price: 99,
    credits: 100,
    features: [
      '100+ videos/month',
      '4K quality',
      'White-label',
      'Team workspace (5 users)',
      'Full API access',
      'Dedicated support',
      'Custom branding',
      'Priority rendering',
    ],
    cta: 'Start Agency',
    href: '/signup?plan=agency',
    highlighted: false,
    description: 'For teams and agencies',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-linear-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 text-center">
        <Badge
          variant="secondary"
          className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          <Zap className="mr-1 sm:mr-1.5 h-3 w-3" />
          Powered by Gemini, ElevenLabs, HeyGen & D-ID
        </Badge>
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
          <span className="bg-linear-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Create Viral AI Videos
            <br />
            in Minutes
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed">
          Turn any topic into a polished, professional video with AI voiceover,
          avatars, and stock footage. No camera. No editing experience. No
          expensive equipment.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
            asChild
          >
            <Link href="/signup">
              Start Creating Free{' '}
              <Wand2 className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-2 hover:bg-slate-50 dark:hover:bg-slate-900"
            asChild
          >
            <Link href="#features">
              <Play className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              See How It Works
            </Link>
          </Button>
        </div>
        <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-12 sm:mb-16">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-600" />3 free videos per month
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            Enterprise security
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-bold bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <p className="text-xs xs:text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Hero Video Preview */}
        <div className="rounded-xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-1 max-w-5xl mx-auto shadow-2xl">
          <div className="aspect-video rounded-xl sm:rounded-3xl bg-linear-to-br from-slate-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-purple-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border-2 border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                <Play className="h-8 sm:h-10 w-8 sm:w-10 text-white ml-1 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-white/70 text-xs flex items-center gap-2 bg-black/40 backdrop-blur px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="hidden xs:inline">
                Sample video generated with voxara
              </span>
              <span className="xs:hidden">Sample video</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 sm:py-20 md:py-24 border-t"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6">
              Everything you need to create professional videos
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by the latest AI technology and enterprise infrastructure.
              Used by 50k+ creators worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white dark:bg-slate-800/50 rounded-lg sm:rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg sm:rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                  <f.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section
        id="use-cases"
        className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-950"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6">
              Perfect for any industry
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a creator, marketer, educator or entrepreneur,
              voxara scales with your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {USE_CASES.map((useCase) => (
              <div
                key={useCase.title}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-6 sm:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
              >
                <div className="shrink-0">
                  <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20">
                    <useCase.icon className="h-6 sm:h-7 w-6 sm:w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {useCase.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6">
              Trusted by 50K+ creators
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of creators, agencies, and businesses using voxara
              to grow their audience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Sarah M.',
                role: 'YouTube Creator',
                text: 'I went from 0 to 100k subscribers in 6 months using voxara. The quality is unbelievable.',
                avatar: 'SM',
              },
              {
                name: 'James D.',
                role: 'Marketing Agency',
                text: "We're using it for all our client video ads. The ROI has been incredible and our clients love the turnaround time.",
                avatar: 'JD',
              },
              {
                name: 'Emma L.',
                role: 'E-Commerce',
                text: 'Product demo videos that used to take weeks now take hours. Our conversion rate increased by 35%.',
                avatar: 'EL',
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-950"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No surprises. Cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-lg sm:rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-2xl sm:scale-105 border-2 border-transparent order-2 sm:order-0'
                    : 'bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-top-4">
                    <Badge className="bg-white text-blue-600 shadow-lg font-semibold px-3 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                      <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
                  <p
                    className={`text-xs sm:text-sm ${plan.highlighted ? 'text-white/80' : 'text-muted-foreground'} mt-1`}
                  >
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6 sm:mb-8">
                  <span
                    className={`text-4xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : ''}`}
                  >
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span
                      className={`text-xs sm:text-sm ml-2 ${plan.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}
                    >
                      /month billed annually
                    </span>
                  )}
                </div>
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 grow">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${plan.highlighted ? 'text-white/90' : ''}`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 ${
                          plan.highlighted
                            ? 'text-white'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full font-semibold h-10 sm:h-11 text-sm transition-all ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-slate-100 hover:shadow-lg'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-12 sm:mt-16 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg sm:rounded-2xl p-6 sm:p-8 border border-blue-200 dark:border-blue-900 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Questions about pricing?
            </p>
            <p className="font-semibold text-sm sm:text-base text-foreground">
              <Link
                href="mailto:sales@voxara.app"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Contact our sales team
              </Link>{' '}
              for volume discounts and custom enterprise plans.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-900 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  q: 'How long does it take to generate a video?',
                  a: "Most videos are generated within 5-15 minutes depending on length and complexity. Longer videos may take up to 30 minutes. You'll receive a notification when your video is ready.",
                },
                {
                  q: 'Can I use these videos commercially?',
                  a: 'Yes! All videos generated with paid plans are yours to use commercially. Free plan videos have a watermark. You retain full rights to your content.',
                },
                {
                  q: 'What video quality can I get?',
                  a: 'Free: 720p | Pro: 1080p | Agency: 4K. All videos are optimized for each platform (YouTube, TikTok, Instagram) and include captions.',
                },
                {
                  q: 'Do you offer API access?',
                  a: 'Yes, Pro and Agency plans include API access. You can programmatically generate videos and integrate voxara into your own applications.',
                },
                {
                  q: 'Is there a monthly commitment?',
                  a: 'No monthly commitment required. You can cancel anytime. Credits expire after 12 months, and you only pay for what you use.',
                },
                {
                  q: 'What happens if I run out of credits?',
                  a: 'You can purchase additional credits anytime. Auto-top up is available on Pro and Agency plans to ensure you never run out.',
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 flex items-start gap-2 sm:gap-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">
                      Q:
                    </span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm ml-6 sm:ml-7">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-12 sm:py-16 md:py-20 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to start creating?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-blue-50 mb-6 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Join 50,000+ creators, agencies, and businesses who are already
            using voxara to grow their audience and increase revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto h-11 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/signup">
                Create your first video free{' '}
                <Wand2 className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-11 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-white/10 text-white border-white hover:bg-white/20"
              asChild
            >
              <Link href="mailto:sales@voxara.app">
                Contact sales{' '}
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
