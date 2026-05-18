'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

// ── Shared ambient background ──────────────────────────────────────────────
function AmbientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-[-10%] h-[55vw] w-[55vw] max-h-[520px] max-w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-5%] left-[-5%] h-[40vw] w-[40vw] max-h-[340px] max-w-[340px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-[-5%] top-1/3 h-[30vw] w-[30vw] max-h-[260px] max-w-[260px] rounded-full bg-primary/5 blur-3xl" />
    </div>
  )
}

// ── Shared page shell ──────────────────────────────────────────────────────
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AmbientBg />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </div>
    </div>
  )
}

// ── Inner content ──────────────────────────────────────────────────────────
function ResetPasswordConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const supabase = createClient()

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!searchParams.get('code')) {
      setError('Invalid or expired password reset link.')
    }
  }, [searchParams])

  async function onSubmit(values: PasswordFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) {
        setError(error.message)
        toast.error(error.message)
        return
      }
      setIsSuccess(true)
      toast.success('Password updated successfully!')
    } catch {
      setError('An unexpected error occurred. Please try again.')
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error && !form.formState.isDirty) {
    return (
      <AuthShell>
        <Card className="w-full max-w-sm border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="items-center px-5 pt-7 pb-2 text-center sm:px-8 sm:pt-9">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-200 dark:bg-red-900/30 dark:ring-red-800/50 sm:h-16 sm:w-16">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400 sm:h-7 sm:w-7" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
              Invalid Link
            </CardTitle>
            <CardDescription className="mt-1 text-xs leading-relaxed sm:text-sm">
              {error}
            </CardDescription>
          </CardHeader>

          <div className="mx-5 sm:mx-8 my-4 h-px bg-border/40" />

          <CardFooter className="justify-center px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            <Button
              variant="outline"
              className="h-10 rounded-xl px-5 text-sm sm:h-11"
              asChild
            >
              <Link href="/reset-password">
                <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
                Request a new link
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthShell>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <AuthShell>
        <Card className="w-full max-w-sm border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="items-center px-5 pt-7 pb-2 text-center sm:px-8 sm:pt-9">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 ring-1 ring-green-200 dark:bg-green-900/30 dark:ring-green-800/50 sm:h-16 sm:w-16">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 sm:h-7 sm:w-7" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
              Password updated!
            </CardTitle>
            <CardDescription className="mt-1 text-xs leading-relaxed sm:text-sm">
              Your password has been successfully changed. You can now sign in.
            </CardDescription>
          </CardHeader>

          <div className="mx-5 sm:mx-8 my-4 h-px bg-border/40" />

          <CardFooter className="justify-center px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            <Button
              className="h-10 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.015] active:scale-[0.985] group sm:h-11"
              asChild
            >
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthShell>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────
  return (
    <AuthShell>
      <div className="w-full max-w-sm space-y-5 sm:max-w-md sm:space-y-6">

        {/* Headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background/80 p-2.5 shadow-lg shadow-black/5 backdrop-blur ring-1 ring-white/10 sm:h-14 sm:w-14">
            <Lock className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Set new password
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Enter and confirm your new password below
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <CardContent className="px-5 pt-5 pb-2 sm:px-8 sm:pt-7 sm:pb-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {/* New password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium sm:text-sm">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Min. 6 characters"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            disabled={isLoading}
                            className="h-10 rounded-xl border-border/60 bg-background/60 px-3.5 pr-11 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 sm:h-11"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            disabled={isLoading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-0 top-0 flex h-full w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 touch-manipulation"
                          >
                            {showPassword
                              ? <EyeOff className="h-4 w-4 shrink-0" />
                              : <Eye className="h-4 w-4 shrink-0" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Confirm password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium sm:text-sm">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Repeat your password"
                            type={showConfirm ? 'text' : 'password'}
                            autoComplete="new-password"
                            disabled={isLoading}
                            className="h-10 rounded-xl border-border/60 bg-background/60 px-3.5 pr-11 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 sm:h-11"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            disabled={isLoading}
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            className="absolute right-0 top-0 flex h-full w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 touch-manipulation"
                          >
                            {showConfirm
                              ? <EyeOff className="h-4 w-4 shrink-0" />
                              : <Eye className="h-4 w-4 shrink-0" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Inline API error */}
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="mt-1 h-10 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:opacity-70 disabled:pointer-events-none group sm:h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      Reset Password
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
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              Back to login
            </Link>
          </CardFooter>
        </Card>

        {/* Security footnote */}
        <p className="text-center text-[10px] text-muted-foreground/60 sm:text-xs">
          Secure authentication powered by Voxara
        </p>
      </div>
    </AuthShell>
  )
}

// ── Suspense boundary for useSearchParams ──────────────────────────────────
export default function ResetPasswordConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordConfirmContent />
    </Suspense>
  )
}