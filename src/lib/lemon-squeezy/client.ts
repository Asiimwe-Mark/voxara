/**
 * @deprecated Lemon Squeezy has been removed from Voxara.
 *
 * Use '@/lib/payment-adapter' instead:
 *   import { createPaymentAdapter } from '@/lib/payment-adapter';
 *
 * This stub exists to prevent hard build errors from any remaining
 * import sites that haven't been updated yet. It throws at runtime.
 */

export class LemonSqueezyClient {
  constructor() {
    throw new Error(
      '[LemonSqueezyClient] Lemon Squeezy has been removed. Use createPaymentAdapter() instead.'
    );
  }
}

export function createLemonSqueezyClient(): never {
  throw new Error(
    '[createLemonSqueezyClient] Lemon Squeezy has been removed. Use createPaymentAdapter() instead.'
  );
}
