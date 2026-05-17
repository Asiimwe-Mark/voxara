'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
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

  if (emailSent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 py-12">
        <div className="text-center max-w-[95vw] sm:max-w-md">
          <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Check your email</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            We sent a confirmation link to{' '}
            <strong className="text-foreground">{form.getValues('email')}</strong>. Click the link to
            activate your account.
          </p>
          <Button 
            variant="outline" 
            className="h-11 sm:h-12 rounded-xl"
            onClick={() => setEmailSent(false)}
          >
            Back to sign up
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-[95vw] sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Create your free account</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Start making AI videos in minutes
          </p>
        </div>

        <ul className="space-y-2 sm:space-y-3">
          {PERKS.map((p) => (
            <li
              key={p}
              className="flex items-start sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>

        <Card className="border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/5">
          <CardContent className="pt-6 px-5 sm:px-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane Doe"
                          autoComplete="name"
                          disabled={isLoading}
                          className="h-11 sm:h-12 rounded-xl border-border/60 bg-background/60 px-4 text-sm shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30"
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
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Min. 8 characters"
                          type="password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className="h-11 sm:h-12 rounded-xl border-border/60 bg-background/60 px-4 text-sm shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer select-none">
                          I agree to the{' '}
                          <Link
                            href="/legal/terms"
                            className="underline hover:text-foreground transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms of Service
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreedToPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer select-none">
                          I agree to the{' '}
                          <Link
                            href="/legal/privacy"
                            className="underline hover:text-foreground transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="h-11 sm:h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  disabled={
                    isLoading ||
                    !form.watch('agreedToTerms') ||
                    !form.watch('agreedToPrivacy')
                  }
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'Creating account…' : 'Create free account'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center pt-0 pb-6 px-5 sm:px-8 sm:pb-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}