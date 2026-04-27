'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

const PERKS = [
  '3 free AI videos — no card required',
  'Script, voice & avatar in minutes',
  'Publish to YouTube, TikTok & more',
]

export default function SignupPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const plan         = searchParams.get('plan') ?? 'free'
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email:    values.email,
        password: values.password,
        options:  { data: { full_name: values.full_name, plan } },
      })
      if (error) { toast.error(error.message); return }
      toast.success('Account created! Check your email to verify.')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="aurora" />
      <div className="absolute inset-0 pattern-dots opacity-50" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4 animate-float">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {plan !== 'free' ? `Starting on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan` : 'Free — no credit card required'}
          </p>
        </div>

        {/* Perks */}
        <div className="flex flex-col gap-1.5 mb-6">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {perk}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card-premium rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Full name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jane Smith"
                        autoComplete="name"
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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Min 8 characters"
                        type="password"
                        autoComplete="new-password"
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
                className="w-full h-11 btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/25 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
                ) : (
                  <>Create free account <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
            By creating an account you agree to our{' '}
            <Link href="/legal/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">Terms</Link>
            {' '}and{' '}
            <Link href="/legal/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</Link>.
          </p>

          <div className="mt-5 pt-5 border-t border-slate-200/70 dark:border-slate-700/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
