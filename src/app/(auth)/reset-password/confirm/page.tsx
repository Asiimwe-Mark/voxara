'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

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

// Wrapper component to use useSearchParams
function ResetPasswordConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Check if we have the required hash from the URL
  useEffect(() => {
    const hash = searchParams.get('code')
    if (!hash) {
      setError('Invalid or expired password reset link.')
    }
  }, [searchParams])

  async function onSubmit(values: PasswordFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        setError(error.message)
        toast.error(error.message)
        return
      }

      setIsSuccess(true)
      toast.success('Password updated successfully!')
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  // Shared background classes for consistency
  const bgClasses = "bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"

  if (error) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 sm:px-6 ${bgClasses}`}>
        <Card className="w-full max-w-[95vw] sm:max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/5">
          <CardHeader className="text-center pt-6 sm:pt-8">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Lock className="h-6 w-6 sm:h-7 sm:w-7 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Invalid Link</CardTitle>
            <CardDescription className="text-sm sm:text-base">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6 sm:pb-8">
            <Link href="/reset-password">
              <Button variant="outline" className="h-11 sm:h-12 px-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Request New Reset Link
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 sm:px-6 ${bgClasses}`}>
        <Card className="w-full max-w-[95vw] sm:max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/5">
          <CardHeader className="text-center pt-6 sm:pt-8">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Password Updated!</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your password has been successfully changed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-6">
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              You can now sign in with your new password.
            </p>
          </CardContent>
          <CardFooter className="justify-center pb-6 sm:pb-8 px-6">
            <Link href="/login" className="w-full">
              <Button className="h-11 sm:h-12 w-full rounded-xl text-sm font-semibold">Sign In</Button>
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
            Set New Password
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">New Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
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
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button 
                type="submit" 
                className="h-11 sm:h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Reset Password'
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

// Main page component with Suspense boundary for useSearchParams
export default function ResetPasswordConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordConfirmContent />
    </Suspense>
  )
}