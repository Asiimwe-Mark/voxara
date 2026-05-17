'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function CheckoutNotifier() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    const credits = searchParams.get('credits')

    if (checkout === 'success') {
      toast.success('Payment successful! Your plan has been upgraded.', {
        duration: 5000,
      })
      window.history.replaceState({}, '', '/dashboard')
    } else if (checkout === 'cancelled') {
      toast.info('Checkout cancelled. No charges were made.')
      window.history.replaceState({}, '', '/dashboard')
    } else if (credits === 'purchased') {
      toast.success('Credits purchased successfully! They\'ve been added to your balance.', {
        duration: 5000,
      })
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  return null
}
