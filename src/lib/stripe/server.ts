/**
 * @deprecated This module exists only for backward-compatibility.
 *
 * Stripe has been removed from Voxara. All payments are now handled by:
 *   - Paddle   (global, USD)     → PAYMENT_PROVIDER=paddle
 *   - Flutterwave (Africa, NGN)  → PAYMENT_PROVIDER=flutterwave
 *
 * Any new code must import from '@/lib/payment-adapter' directly.
 * This file will be deleted in a future cleanup migration.
 */

export { createPaymentAdapter as paymentAdapter } from '@/lib/payment-adapter';
export { createPaymentAdapter } from '@/lib/payment-adapter';
