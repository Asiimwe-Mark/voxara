'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

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

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetFormValues = z.infer<typeof resetSchema>

// ── Ambient background ─────────────────────────────────────────────────────
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

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ResetFormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      setIsSubmitted(true)
      toast.success('Reset instructions sent! Check your email.')
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Submitted / check-email state ──────────────────────────────────────
  if (isSubmitted) {
    return (
      <AuthShell>
        <Card className="w-full max-w-sm border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="items-center px-5 pt-7 pb-2 text-center sm:px-8 sm:pt-9">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 ring-1 ring-green-200 dark:bg-green-900/30 dark:ring-green-800/50 sm:h-16 sm:w-16">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400 sm:h-7 sm:w-7" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
              Check your email
            </CardTitle>
            <CardDescription className="mt-1 text-xs leading-relaxed sm:text-sm">
              We sent password reset instructions to{' '}
              <strong className="break-all text-foreground">
                {form.getValues('email')}
              </strong>
              .
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 pb-2 pt-3 sm:px-8">
            <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              className="mt-4 h-10 w-full rounded-xl text-sm sm:h-11"
              onClick={() => setIsSubmitted(false)}
            >
              Try again
            </Button>
          </CardContent>

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
            <Mail className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Reset your password
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Enter your email and we'll send you a reset link
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium sm:text-sm">
                        Email Address
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

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="mt-1 h-10 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:opacity-70 disabled:pointer-events-none group sm:h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Reset Instructions
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

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