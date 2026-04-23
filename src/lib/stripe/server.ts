import { createPaymentAdapter } from '@/lib/payment-adapter';

/**
 * Payment adapter instance for handling both Lemon Squeezy and Flutterwave
 * Usage: const paymentAdapter = createPaymentAdapter();
 * 
 * Provider is determined by PAYMENT_PROVIDER env var:
 * - 'lemon-squeezy' (default) for global payments
 * - 'flutterwave' for local NGN payments
 */
export const paymentAdapter = createPaymentAdapter();

export const getPaymentProvider = () => {
  return process.env.PAYMENT_PROVIDER || 'lemon-squeezy';
};

