import { verifyWebhookSignatureHmac } from '@/lib/security.node';
import logger from '@/lib/logger';
/**
 * Paddle Payment Provider Client
 * Handles all interactions with the Paddle Billing API
 * See: https://developer.paddle.com/
 */

import crypto from 'crypto';
import {
  PaddleCustomer,
  PaddleCheckoutSession,
  PaddleTransaction,
  PaddleSubscription,
  PaddleCheckoutCreateParams,
  PaddleTransactionCreateParams,
  PaddleSubscriptionCreateParams,
  PaddlePrice,
} from '@/types/paddle';

export interface PaddleClientConfig {
  vendorId: string;
  apiKey: string;
  webhookSecret: string;
  sandboxMode?: boolean;
}

/**
 * PaddleClient - Main client for Paddle API interactions
 */
export class PaddleClient {
  private vendorId: string;
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl: string;
  private sandboxMode: boolean;

  constructor(config: PaddleClientConfig) {
    if (!config.vendorId) throw new Error('PADDLE_VENDOR_ID is required');
    if (!config.apiKey) throw new Error('PADDLE_API_KEY is required');
    if (!config.webhookSecret) throw new Error('PADDLE_WEBHOOK_SECRET is required');

    this.vendorId = config.vendorId;
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
    this.sandboxMode = config.sandboxMode ?? true;
    this.baseUrl = 'https://api.paddle.com';
  }

  /**
   * Make authenticated request to Paddle API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'faceless-video-saas/1.0.0',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Paddle API Error (${response.status}): ${error.error?.message || response.statusText}`
        );
      }

      const data = (await response.json()) as { data?: T };
      return data.data as T;
    } catch (error) {
      logger.error(`Paddle API request failed: ${method} ${endpoint}`, { detail: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    locale?: string;
    customData?: Record<string, unknown>;
  }): Promise<PaddleCustomer> {
    return this.request<PaddleCustomer>(
      'POST',
      '/customers',
      {
        email: params.email,
        name: params.name,
        locale: params.locale,
        custom_data: params.customData,
      }
    );
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<PaddleCustomer> {
    return this.request<PaddleCustomer>(
      'GET',
      `/customers/${customerId}`
    );
  }

  /**
   * Get or create customer
   */
  async getOrCreateCustomer(params: {
    email: string;
    name?: string;
    locale?: string;
  }): Promise<PaddleCustomer> {
    try {
      // Try to find existing customer by email
      // Note: Paddle API doesn't have a direct search endpoint,
      // so we'll create a new one and let the API handle uniqueness
      return await this.createCustomer(params);
    } catch (error) {
      // If customer already exists, retrieve by email
      // For now, we'll retry with a get approach
      logger.warn('Error creating customer, attempting retrieval', { detail: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckout(
    params: PaddleCheckoutCreateParams
  ): Promise<PaddleCheckoutSession> {
    return this.request<PaddleCheckoutSession>(
      'POST',
      '/checkouts',
      {
        items: params.items,
        customer_id: params.customer_id,
        customer_email: params.customer_email,
        currency_code: params.currency_code || 'USD',
        discount_id: params.discount_id,
        business_id: params.business_id,
        collection_mode: params.collection_mode || 'automatic',
        billing_details: params.billing_details,
        custom_data: params.custom_data,
        return_url: params.return_url,
      }
    );
  }

  /**
   * Create a transaction (one-time payment)
   */
  async createTransaction(
    params: PaddleTransactionCreateParams
  ): Promise<PaddleTransaction> {
    return this.request<PaddleTransaction>(
      'POST',
      '/transactions',
      {
        customer_id: params.customer_id,
        address_id: params.address_id,
        business_id: params.business_id,
        items: params.items,
        currency_code: params.currency_code || 'USD',
        collection_mode: params.collection_mode || 'automatic',
        discount_id: params.discount_id,
        custom_data: params.custom_data,
        billing_details: params.billing_details,
      }
    );
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<PaddleTransaction> {
    return this.request<PaddleTransaction>(
      'GET',
      `/transactions/${transactionId}`
    );
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    params: PaddleSubscriptionCreateParams
  ): Promise<PaddleSubscription> {
    return this.request<PaddleSubscription>(
      'POST',
      '/subscriptions',
      {
        customer_id: params.customer_id,
        items: params.items,
        currency_code: params.currency_code || 'USD',
        collection_mode: params.collection_mode || 'automatic',
        billing_details: params.billing_details,
        custom_data: params.custom_data,
        discount_id: params.discount_id,
        proration_billing_mode: params.proration_billing_mode,
        trial_period: params.trial_period,
      }
    );
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<PaddleSubscription> {
    return this.request<PaddleSubscription>(
      'GET',
      `/subscriptions/${subscriptionId}`
    );
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    params: {
      items?: Array<{ price_id: string; quantity: number }>;
      customData?: Record<string, unknown>;
      collectionMode?: 'automatic' | 'manual';
      discountId?: string;
    }
  ): Promise<PaddleSubscription> {
    const body: Record<string, unknown> = {};

    if (params.items) body.items = params.items;
    if (params.customData) body.custom_data = params.customData;
    if (params.collectionMode) body.collection_mode = params.collectionMode;
    if (params.discountId) body.discount_id = params.discountId;

    return this.request<PaddleSubscription>(
      'PATCH',
      `/subscriptions/${subscriptionId}`,
      body
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<PaddleSubscription> {
    return this.request<PaddleSubscription>(
      'PATCH',
      `/subscriptions/${subscriptionId}`,
      { status: 'canceled' }
    );
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<PaddleSubscription> {
    return this.request<PaddleSubscription>(
      'PATCH',
      `/subscriptions/${subscriptionId}`,
      { pause: true }
    );
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<PaddleSubscription> {
    return this.request<PaddleSubscription>(
      'PATCH',
      `/subscriptions/${subscriptionId}`,
      { pause: false }
    );
  }

  /**
   * Get price by ID
   */
  async getPrice(priceId: string): Promise<PaddlePrice> {
    return this.request<PaddlePrice>(
      'GET',
      `/prices/${priceId}`
    );
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   * @param payload Raw request body as string
   * @param signature X-Paddle-Signature header value
   * @returns boolean indicating if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      return verifyWebhookSignatureHmac(payload, signature, this.webhookSecret);
    } catch (error) {
      logger.error('Webhook signature verification failed', { detail: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Get sandbox mode status
   */
  isSandboxMode(): boolean {
    return this.sandboxMode;
  }

  /**
   * Get Paddle portal link for customer
   */
  getCustomerPortalUrl(customerId: string): string {
    const baseUrl = this.sandboxMode
      ? 'https://sandbox-login.paddle.com'
      : 'https://app.paddle.com';
    
    return `${baseUrl}/customers/${customerId}`;
  }
}

/**
 * Factory function to create a Paddle client with environment variables
 */
export function createPaddleClient(): PaddleClient {
  const vendorId = process.env.PADDLE_VENDOR_ID;
  const apiKey = process.env.PADDLE_API_KEY;
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const sandboxMode = process.env.PADDLE_SANDBOX_MODE === 'true';

  if (!vendorId || !apiKey || !webhookSecret) {
    throw new Error(
      'Paddle client initialization failed: Missing required environment variables (PADDLE_VENDOR_ID, PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET)'
    );
  }

  return new PaddleClient({
    vendorId,
    apiKey,
    webhookSecret,
    sandboxMode,
  });
}
