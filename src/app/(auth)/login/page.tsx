'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Sparkles, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) { toast.error(error.message); return }
      toast.success('Welcome back!')
      router.push(searchParams.get('redirect') ?? '/dashboard')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background aurora */}
      <div className="aurora" />
      <div className="absolute inset-0 pattern-dots opacity-50" />

      <div className="relative w-full max-w-md animate-fade-up">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4 animate-float">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Sign in to your voxara account
          </p>
        </div>

        {/* Card */}
        <div className="card-premium rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        className="h-11 bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <Link
                        href="/reset-password"
                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="h-11 bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/25 font-medium transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
                ) : (
                  <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-700/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Shield className="w-3.5 h-3.5" />
          <span>256-bit encryption · SOC 2 compliant · Your data stays yours</span>
        </div>
      </div>
    </div>
  )
}
