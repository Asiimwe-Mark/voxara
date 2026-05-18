'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react'

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
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Welcome back!')
      const redirectTo = searchParams.get('redirect') ?? '/dashboard'
      router.push(redirectTo)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">

      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[55vw] w-[55vw] max-h-[520px] max-w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] h-[40vw] w-[40vw] max-h-[340px] max-w-[340px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-[-5%] top-1/3 h-[30vw] w-[30vw] max-h-[260px] max-w-[260px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* ── Centered layout shell ── */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">

        {/* ── Brand mark ── */}
        <div className="mb-7 sm:mb-8 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl border border-border/50 bg-background/80 p-3 shadow-lg shadow-black/5 backdrop-blur ring-1 ring-white/10">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Sign in to continue to your Voxara workspace
            </p>
          </div>
        </div>

        {/* ── Auth card ── */}
        <Card className="w-full max-w-sm sm:max-w-md border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl">

          <CardContent className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-5"
                noValidate
              >

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          autoCapitalize="none"
                          inputMode="email"
                          disabled={isLoading}
                          className="h-10 sm:h-11 rounded-xl border-border/60 bg-background/60 px-3.5 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
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
                      {/* Label row with forgot-password link */}
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel className="text-xs sm:text-sm font-medium">
                          Password
                        </FormLabel>
                        <Link
                          href="/reset-password"
                          className="shrink-0 text-[11px] sm:text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:underline"
                          tabIndex={0}
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-10 sm:h-11 rounded-xl border-border/60 bg-background/60 px-3.5 pr-11 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
                            {...field}
                          />
                          {/* Show/hide toggle — min 44px touch target */}
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

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="mt-1 h-10 sm:h-11 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:opacity-70 disabled:pointer-events-none group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          {/* Divider */}
          <div className="mx-5 sm:mx-8 my-4 h-px bg-border/40" />

          <CardFooter className="flex justify-center px-5 pb-5 pt-0 sm:px-8 sm:pb-7">
            <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Create one free
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* ── Security footnote ── */}
        <p className="mt-6 text-center text-[10px] text-muted-foreground/60 sm:text-xs">
          Secure authentication powered by Voxara
        </p>

      </div>
    </main>
  )
}