'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password/confirm`,
        }
      )

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSubmitted(true)
      toast.success('Reset instructions sent! Check your email.')
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Shared background classes for consistency with your design system
  const bgClasses = "bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"

  if (isSubmitted) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 sm:px-6 ${bgClasses}`}>
        <Card className="w-full max-w-[95vw] sm:max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/5">
          <CardHeader className="text-center pt-6 sm:pt-8 px-6 sm:px-8">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Check Your Email</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-6 sm:px-8">
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              className="h-11 sm:h-12 w-full rounded-xl"
              onClick={() => setIsSubmitted(false)}
            >
              Try Again
            </Button>
          </CardContent>
          <CardFooter className="justify-center pb-6 sm:pb-8 px-6 sm:px-8">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 sm:px-6 ${bgClasses}`}>
      <Card className="w-full max-w-[95vw] sm:max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/5">
        <CardHeader className="space-y-1 pt-6 sm:pt-8 px-6 sm:px-8">
          <CardTitle className="text-2xl sm:text-3xl text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
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
              <Button 
                type="submit" 
                className="h-11 sm:h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pb-6 sm:pb-8 px-6 sm:px-8">
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}