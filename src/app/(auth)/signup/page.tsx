'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service',
  }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Privacy Policy',
  }),
})

type FormValues = z.infer<typeof schema>

const PERKS = [
  '1 free AI video per month',
  'No camera or editing skills required',
  'Publish to YouTube, TikTok, Instagram',
]

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
      setEmailSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Email-sent confirmation state ──────────────────────────────────────────
  if (emailSent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm text-center sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
          {/* Icon */}
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-1 ring-green-200 dark:bg-green-900/30 dark:ring-green-800/50 sm:h-20 sm:w-20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 sm:h-10 sm:w-10" />
          </div>

          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Check your email
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We sent a confirmation link to{' '}
            <strong className="break-all text-foreground">
              {form.getValues('email')}
            </strong>
            . Click the link to activate your account.
          </p>

          <Button
            variant="outline"
            className="mt-6 h-10 rounded-xl px-6 text-sm sm:h-11"
            onClick={() => setEmailSent(false)}
          >
            Back to sign up
          </Button>
        </div>
      </main>
    )
  }

  // ── Main sign-up form ──────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">

      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[55vw] w-[55vw] max-h-130 max-w-130 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] h-[40vw] w-[40vw] max-h-85 max-w-85 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-[-5%] top-1/3 h-[30vw] w-[30vw] max-h-65 max-w-65 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full sm:max-w-2/4 space-y-5 sm:space-y-6">

          {/* ── Brand mark + headline ── */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background/80 p-2.5 shadow-lg shadow-black/5 backdrop-blur ring-1 ring-white/10 sm:h-14 sm:w-14">
              <Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Create your free account
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Start making AI videos in minutes
              </p>
            </div>
          </div>

          {/* ── Perks list ── */}
          <ul className="flex flex-col gap-2 sm:gap-2.5">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                <span className="leading-snug">{perk}</span>
              </li>
            ))}
          </ul>

          {/* ── Auth card ── */}
          <Card className="border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl">
            <CardContent className="px-5 pt-5 pb-2 sm:px-8 sm:pt-7 sm:pb-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-4"
                  noValidate
                >
                  {/* Full name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium sm:text-sm">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
                            autoComplete="name"
                            autoCapitalize="words"
                            disabled={isLoading}
                            className="h-10 rounded-xl border-border/60 bg-background/60 px-3.5 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 sm:h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium sm:text-sm">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            inputMode="email"
                            disabled={isLoading}
                            className="h-10 rounded-xl border-border/60 bg-background/60 px-3.5 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 sm:h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium sm:text-sm">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Min. 8 characters"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              disabled={isLoading}
                              className="h-10 rounded-xl border-border/60 bg-background/60 px-3.5 pr-11 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 sm:h-11"
                              {...field}
                            />
                            {/* Show/hide — full 44px tap target */}
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              disabled={isLoading}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              className="absolute right-0 top-0 flex h-full w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 touch-manipulation"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 shrink-0" />
                              ) : (
                                <Eye className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Consent checkboxes — grouped visually */}
                  <div className="space-y-2.5 rounded-xl border border-border/40 bg-muted/10 px-3.5 py-3 sm:px-4 sm:py-3.5">
                    <FormField
                      control={form.control}
                      name="agreedToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                            />
                          </FormControl>
                          <div className="min-w-0">
                            <FormLabel className="text-xs font-normal leading-relaxed cursor-pointer select-none sm:text-sm">
                              I agree to the{' '}
                              <Link
                                href="/legal/terms"
                                className="underline underline-offset-2 hover:text-foreground transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Terms of Service
                              </Link>
                            </FormLabel>
                            <FormMessage className="text-xs mt-0.5" />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Hairline divider between consent items */}
                    <div className="h-px bg-border/30" />

                    <FormField
                      control={form.control}
                      name="agreedToPrivacy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                            />
                          </FormControl>
                          <div className="min-w-0">
                            <FormLabel className="text-xs font-normal leading-relaxed cursor-pointer select-none sm:text-sm">
                              I agree to the{' '}
                              <Link
                                href="/legal/privacy"
                                className="underline underline-offset-2 hover:text-foreground transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage className="text-xs mt-0.5" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={
                      isLoading ||
                      !form.watch('agreedToTerms') ||
                      !form.watch('agreedToPrivacy')
                    }
                    className="mt-1 h-10 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:opacity-70 disabled:pointer-events-none group sm:h-11"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create free account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            {/* Divider */}
            <div className="mx-5 sm:mx-8 my-4 h-px bg-border/40" />

            <CardFooter className="justify-center px-5 pb-5 pt-0 sm:px-8 sm:pb-7">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* ── Security footnote ── */}
          <p className="text-center text-[10px] text-muted-foreground/60 sm:text-xs">
            Secure authentication powered by Voxara
          </p>

        </div>
      </div>
    </main>
  )
}