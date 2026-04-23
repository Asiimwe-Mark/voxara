import { PaddleClient, createPaddleClient } from './paddle/client';
import { FlutterwaveClient, createFlutterwaveClient } from './flutterwave/client';
import { LemonSqueezyClient, createLemonSqueezyClient } from './lemon-squeezy/client';

/**
 * Payment providers supported by the adapter
 * 'paddle' - Primary provider (Stripe, Visa, Mastercard, etc.) - Global USD payments
 * 'flutterwave' - Secondary provider for local payments (NGN, etc.)
 * 'lemon-squeezy' - Legacy provider (deprecated, being phased out)
 */
export type PaymentProvider = 'paddle' | 'flutterwave' | 'lemon-squeezy';

export interface PaymentConfig {
  provider: PaymentProvider;
  currency?: string;
  webhookSecret: string;
}

export interface CheckoutParams {
  userId: string;
  email: string;
  amount: number;
  credits?: number;
  planType?: 'free' | 'pro' | 'agency';
  mode: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionParams {
  userId: string;
  email: string;
  planId: string;
  customData?: Record<string, any>;
}

export interface PaymentSession {
  id: string;
  url?: string;
  status: string;
  metadata: Record<string, any>;
}

/**
 * Unified Payment Adapter - abstracts multiple payment providers
 * Supports Paddle (primary), Flutterwave (local), and Lemon Squeezy (legacy/deprecated)
 */
export class PaymentAdapter {
  private paddle: PaddleClient | null = null;
  private flutterwave: FlutterwaveClient;
  private lemonSqueezy: LemonSqueezyClient | null = null;
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;

    // Initialize only the configured provider
    if (config.provider === 'paddle') {
      try {
        this.paddle = createPaddleClient();
      } catch (error) {
        console.error('Failed to initialize Paddle client:', error);
        throw error;
      }
    } else if (config.provider === 'lemon-squeezy') {
      try {
        this.lemonSqueezy = createLemonSqueezyClient();
      } catch (error) {
        console.error('Failed to initialize Lemon Squeezy client:', error);
        throw error;
      }
    }

    // Always initialize Flutterwave as fallback
    this.flutterwave = createFlutterwaveClient();
  }

  /**
   * Create a checkout session with the configured payment provider
   */
  async createCheckout(params: CheckoutParams): Promise<PaymentSession> {
    if (this.config.provider === 'paddle') {
      return this.createPaddleCheckout(params);
    } else if (this.config.provider === 'lemon-squeezy') {
      return this.createLemonSqueezyCheckout(params);
    } else if (this.config.provider === 'flutterwave') {
      return this.createFlutterwaveCheckout(params);
    }
    throw new Error(`Unknown payment provider: ${this.config.provider}`);
  }

  /**
   * Create Paddle checkout session
   */
  private async createPaddleCheckout(params: CheckoutParams): Promise<PaymentSession> {
    if (!this.paddle) {
      throw new Error('Paddle client not initialized');
    }

    try {
      // Get or create Paddle customer
      const customer = await this.paddle.getOrCreateCustomer({
        email: params.email,
        name: undefined, // Can be enriched from user profile if needed
      });

      // Map plan type to price ID
      const priceIdMap: Record<string, string> = {
        'free': process.env.PADDLE_CREDIT_PRODUCT_ID!,
        'pro': process.env.PADDLE_PRO_PLAN_ID!,
        'agency': process.env.PADDLE_AGENCY_PLAN_ID!,
      };

      const priceId = priceIdMap[params.planType || 'free'];

      if (!priceId) {
        throw new Error(`No price ID configured for plan type: ${params.planType}`);
      }

      // Create checkout session
      const checkout = await this.paddle.createCheckout({
        items: [{ price_id: priceId, quantity: 1 }],
        customer_id: customer.id,
        currency_code: 'USD',
        custom_data: {
          user_id: params.userId,
          credits: params.credits,
          plan_type: params.planType,
          mode: params.mode,
          ...params.metadata,
        },
        return_url: params.successUrl,
      });

      return {
        id: checkout.id,
        url: checkout.checkout_url,
        status: checkout.status,
        metadata: {
          provider: 'paddle',
          user_id: params.userId,
          customer_id: customer.id,
          credits: params.credits,
        },
      };
    } catch (error) {
      console.error('Paddle checkout creation failed:', error);
      throw error;
    }
  }

  private async createLemonSqueezyCheckout(params: CheckoutParams): Promise<PaymentSession> {
    // Determine product ID based on plan type
    const productIdMap: Record<string, string> = {
      'free': process.env.LEMON_SQUEEZY_FREE_PRODUCT_ID!,
      'pro': process.env.LEMON_SQUEEZY_PRO_VARIANT_ID!,
      'agency': process.env.LEMON_SQUEEZY_AGENCY_VARIANT_ID!,
    };

    const variantIdMap: Record<string, string> = {
      'free': process.env.LEMON_SQUEEZY_FREE_VARIANT_ID!,
      'pro': params.mode === 'subscription' 
        ? process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID! 
        : process.env.LEMON_SQUEEZY_CREDIT_PACK_VARIANT_ID!,
      'agency': params.mode === 'subscription'
        ? process.env.LEMON_SQUEEZY_AGENCY_MONTHLY_VARIANT_ID!
        : process.env.LEMON_SQUEEZY_CREDIT_PACK_VARIANT_ID!,
    };

    const response = await this.lemonSqueezy.createCheckout({
      productId: productIdMap[params.planType || 'free'],
      variantId: variantIdMap[params.planType || 'free'],
      customerEmail: params.email,
      customData: {
        user_id: params.userId,
        credits: params.credits,
        plan_type: params.planType,
        mode: params.mode,
        ...params.metadata,
      },
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });

    return {
      id: response.data.id,
      url: response.data.attributes.url,
      status: 'pending',
      metadata: {
        provider: 'lemon-squeezy',
        user_id: params.userId,
        credits: params.credits,
      },
    };
  }

  private async createFlutterwaveCheckout(params: CheckoutParams): Promise<PaymentSession> {
    const amountInKobo = Math.round(params.amount * 100);
    const txRef = `${params.userId}-${Date.now()}`;

    const response = await this.flutterwave.initializePayment({
      amount: amountInKobo,
      email: params.email,
      currency: this.config.currency || 'NGN',
      txRef,
      customData: {
        user_id: params.userId,
        credits: params.credits,
        plan_type: params.planType,
        mode: params.mode,
        ...params.metadata,
      },
      redirectUrl: params.successUrl,
      meta: {
        userId: params.userId,
      },
    });

    if (response.status !== 'success') {
      throw new Error(`Failed to initialize Flutterwave payment: ${response.message}`);
    }

    return {
      id: response.data.link,
      url: response.data.link,
      status: 'pending',
      metadata: {
        provider: 'flutterwave',
        user_id: params.userId,
        tx_ref: txRef,
        credits: params.credits,
      },
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (this.config.provider === 'paddle') {
      if (!this.paddle) {
        console.error('Paddle client not initialized for signature verification');
        return false;
      }
      return this.paddle.verifyWebhookSignature(payload, signature);
    } else if (this.config.provider === 'lemon-squeezy') {
      if (!this.lemonSqueezy) {
        console.error('Lemon Squeezy client not initialized for signature verification');
        return false;
      }
      return this.lemonSqueezy.verifyWebhookSignature(
        process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
        payload,
        signature
      );
    } else if (this.config.provider === 'flutterwave') {
      return this.flutterwave.verifyWebhookSignature(payload, signature);
    }
    return false;
  }

  /**
   * Get the payment provider client
   */
  getProvider() {
    if (this.config.provider === 'lemon-squeezy') {
      return this.lemonSqueezy;
    } else if (this.config.provider === 'flutterwave') {
      return this.flutterwave;
    }
    throw new Error(`Unknown payment provider: ${this.config.provider}`);
  }
}

/**
 * Create a payment adapter instance with the default configured provider
 * Defaults to 'paddle' if PAYMENT_PROVIDER is not set
 */
export const createPaymentAdapter = () => {
  const provider = (process.env.PAYMENT_PROVIDER || 'paddle') as PaymentProvider;

  if (!['paddle', 'flutterwave', 'lemon-squeezy'].includes(provider)) {
    throw new Error(`Invalid PAYMENT_PROVIDER: ${provider}. Must be 'paddle', 'flutterwave', or 'lemon-squeezy'`);
  }

  return new PaymentAdapter({
    provider,
    currency: provider === 'flutterwave' ? 'NGN' : 'USD',
    webhookSecret: provider === 'paddle'
      ? process.env.PADDLE_WEBHOOK_SECRET!
      : provider === 'lemon-squeezy'
      ? process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!
      : process.env.FLUTTERWAVE_WEBHOOK_SECRET!,
  });
};
