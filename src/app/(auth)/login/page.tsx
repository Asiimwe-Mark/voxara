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
  Eye,
  EyeOff,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
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
    defaultValues: {
      email: '',
      password: '',
    },
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
      {/* Background Effects - responsive scaling */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-0 left-0 h-[30vh] w-[30vh] rounded-full bg-primary/5 blur-3xl sm:h-[300px] sm:w-[300px]" />
        <div className="absolute right-0 top-1/3 h-[25vh] w-[25vh] rounded-full bg-primary/5 blur-3xl sm:h-[250px] sm:w-[250px]" />
      </div>

      <div className="container relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-10">
            <div className="mb-6 inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-border/50 bg-background/80 shadow-lg backdrop-blur">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Sign in to continue to your Voxara workspace
            </p>
          </div>

          {/* Card */}
          <Card className="border-border/50 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-xl">
            <CardContent className="p-5 sm:p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          Email Address
                        </FormLabel>

                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={isLoading}
                            className="h-11 sm:h-12 rounded-xl border-border/60 bg-background/60 px-4 text-sm shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel className="text-sm font-medium">
                            Password
                          </FormLabel>

                          <Link
                            href="/reset-password"
                            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
                              className="h-11 sm:h-12 rounded-xl border-border/60 bg-background/60 px-4 pr-12 text-sm shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30"
                              {...field}
                            />

                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 flex min-w-[2rem] h-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground touch-manipulation"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="h-11 sm:h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex justify-center px-5 pb-6 pt-0 sm:px-8">
              <p className="text-center text-sm leading-relaxed text-muted-foreground">
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

          {/* Footer */}
          <p className="mt-6 sm:mt-8 text-center text-xs text-muted-foreground sm:text-sm">
            Secure authentication powered by Voxara
          </p>
        </div>
      </div>
    </main>
  )
}