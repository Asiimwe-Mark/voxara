/**
 * Payment Adapter — Voxara
 *
 * Supported providers:
 *   paddle      — Primary (global, USD, card/PayPal). Set PAYMENT_PROVIDER=paddle
 *   flutterwave — Africa / local currencies (NGN, KES, GHS, ZAR). Set PAYMENT_PROVIDER=flutterwave
 *
 * Stripe and Lemon Squeezy have been removed entirely.
 */

import { PaddleClient, createPaddleClient } from './paddle/client';
import { FlutterwaveClient, createFlutterwaveClient } from './flutterwave/client';

export type PaymentProvider = 'paddle' | 'flutterwave';

export interface CheckoutParams {
  userId: string;
  email: string;
  amount: number;
  credits?: number;
  planType?: 'free' | 'pro' | 'agency';
  mode: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface PaymentSession {
  id: string;
  url: string;
  status: string;
  metadata: Record<string, string | number | boolean | null>;
}

// ─── Paddle price map ────────────────────────────────────────────────────────
const PADDLE_PRICE_IDS: Record<string, string> = {
  pro_monthly:    process.env.PADDLE_PRO_MONTHLY_PRICE_ID    ?? '',
  pro_yearly:     process.env.PADDLE_PRO_YEARLY_PRICE_ID     ?? '',
  agency_monthly: process.env.PADDLE_AGENCY_MONTHLY_PRICE_ID ?? '',
  agency_yearly:  process.env.PADDLE_AGENCY_YEARLY_PRICE_ID  ?? '',
  credits_10:     process.env.PADDLE_CREDITS_10_PRICE_ID     ?? '',
  credits_25:     process.env.PADDLE_CREDITS_25_PRICE_ID     ?? '',
  credits_50:     process.env.PADDLE_CREDITS_50_PRICE_ID     ?? '',
};

// ─── PaymentAdapter class ────────────────────────────────────────────────────

export class PaymentAdapter {
  private readonly provider: PaymentProvider;
  private paddle: PaddleClient | null  = null;
  private flutterwave: FlutterwaveClient | null = null;

  constructor(provider: PaymentProvider) {
    this.provider = provider;

    if (provider === 'paddle') {
      this.paddle = createPaddleClient();
    } else {
      this.flutterwave = createFlutterwaveClient();
    }
  }

  /** Create a checkout session with the active provider */
  async createCheckout(params: CheckoutParams): Promise<PaymentSession> {
    if (this.provider === 'paddle') return this.paddleCheckout(params);
    return this.flutterwaveCheckout(params);
  }

  /** Verify webhook signature */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (this.provider === 'paddle' && this.paddle) {
      return this.paddle.verifyWebhookSignature(payload, signature);
    }
    if (this.provider === 'flutterwave' && this.flutterwave) {
      return this.flutterwave.verifyWebhookSignature(payload, signature);
    }
    return false;
  }

  /** Expose the underlying provider client (used by auto-topup) */
  getProvider(): PaddleClient | FlutterwaveClient {
    if (this.provider === 'paddle' && this.paddle) return this.paddle;
    if (this.provider === 'flutterwave' && this.flutterwave) return this.flutterwave;
    throw new Error(`Provider client not initialized: ${this.provider}`);
  }

  // ── Paddle ────────────────────────────────────────────────────────────────

  private async paddleCheckout(params: CheckoutParams): Promise<PaymentSession> {
    if (!this.paddle) throw new Error('Paddle client not initialized');

    const priceKey =
      params.mode === 'payment'
        ? `credits_${params.credits ?? 25}`
        : `${params.planType ?? 'pro'}_monthly`;

    const priceId = PADDLE_PRICE_IDS[priceKey];
    if (!priceId) throw new Error(`No Paddle price ID for key: ${priceKey}`);

    const customer = await this.paddle.getOrCreateCustomer({ email: params.email });

    const checkout = await this.paddle.createCheckout({
      items: [{ price_id: priceId, quantity: 1 }],
      customer_id: customer.id,
      currency_code: 'USD',
      custom_data: {
        user_id:   params.userId,
        credits:   params.credits  ?? null,
        plan_type: params.planType ?? null,
        mode:      params.mode,
        ...params.metadata,
      },
      return_url: params.successUrl,
    });

    return {
      id:       checkout.id,
      url:      checkout.checkout_url,
      status:   checkout.status ?? 'pending',
      metadata: {
        provider:    'paddle',
        user_id:     params.userId,
        customer_id: customer.id,
        credits:     params.credits ?? null,
      },
    };
  }

  // ── Flutterwave ───────────────────────────────────────────────────────────

  private async flutterwaveCheckout(params: CheckoutParams): Promise<PaymentSession> {
    if (!this.flutterwave) throw new Error('Flutterwave client not initialized');

    // Amount in Naira kobo (×100) — Flutterwave's base unit for NGN
    const amountInKobo = Math.round(params.amount * 100);
    const txRef = `voxara-${params.userId}-${Date.now()}`;

    const response = await this.flutterwave.initializePayment({
      amount:      amountInKobo,
      email:       params.email,
      currency:    'NGN',
      txRef,
      redirectUrl: params.successUrl,
      customData: {
        user_id:   params.userId,
        credits:   params.credits  ?? null,
        plan_type: params.planType ?? null,
        mode:      params.mode,
        ...params.metadata,
      },
      meta: { userId: params.userId },
    });

    if (response.status !== 'success') {
      throw new Error(`Flutterwave error: ${response.message ?? 'unknown'}`);
    }

    return {
      id:     txRef,
      url:    response.data.link,
      status: 'pending',
      metadata: {
        provider: 'flutterwave',
        user_id:  params.userId,
        tx_ref:   txRef,
        credits:  params.credits ?? null,
      },
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createPaymentAdapter(): PaymentAdapter {
  const raw = (process.env.PAYMENT_PROVIDER ?? 'paddle').toLowerCase();

  if (raw !== 'paddle' && raw !== 'flutterwave') {
    throw new Error(
      `Invalid PAYMENT_PROVIDER="${raw}". Must be "paddle" or "flutterwave".`
    );
  }

  return new PaymentAdapter(raw as PaymentProvider);
}
