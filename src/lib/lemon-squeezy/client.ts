import fetch from 'node-fetch';

export interface LemonSqueezyConfig {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
}

export class LemonSqueezyClient {
  private apiKey: string;
  private storeId: string;
  private baseUrl = 'https://api.lemonsqueezy.com/v1';

  constructor(config: LemonSqueezyConfig) {
    if (!config.apiKey) throw new Error('LEMON_SQUEEZY_API_KEY is required');
    if (!config.storeId) throw new Error('LEMON_SQUEEZY_STORE_ID is required');
    this.apiKey = config.apiKey;
    this.storeId = config.storeId;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Lemon Squeezy API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Create a checkout session
   */
  async createCheckout(params: {
    productId: string;
    variantId?: string;
    customData?: Record<string, any>;
    customerEmail?: string;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          product_id: params.productId,
          ...(params.variantId && { variant_id: params.variantId }),
          custom_data: params.customData,
          ...(params.customerEmail && { customer_email: params.customerEmail }),
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
        },
      },
    };

    return this.request('/checkouts', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  /**
   * Get customer info
   */
  async getCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`);
  }

  /**
   * Create a customer subscription
   */
  async createSubscription(params: {
    customerId: string;
    variantId: string;
    trialDays?: number;
    customData?: Record<string, any>;
  }) {
    const subscriptionData = {
      data: {
        type: 'subscriptions',
        attributes: {
          customer_id: params.customerId,
          variant_id: params.variantId,
          trial_days: params.trialDays || 0,
          custom_data: params.customData,
        },
      },
    };

    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    subscriptionId: string,
    params: {
      productVariantId?: string;
      pause?: boolean;
      resume?: boolean;
      customData?: Record<string, any>;
    }
  ) {
    const updateData: any = {
      data: {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: {},
      },
    };

    if (params.productVariantId) {
      updateData.data.attributes.product_variant_id = params.productVariantId;
    }
    if (typeof params.pause === 'boolean') {
      updateData.data.attributes.pause = params.pause;
    }
    if (typeof params.resume === 'boolean') {
      updateData.data.attributes.resume = params.resume;
    }
    if (params.customData) {
      updateData.data.attributes.custom_data = params.customData;
    }

    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all orders for a customer
   */
  async getCustomerOrders(customerId: string) {
    return this.request(`/orders?filter[customer_id]=${customerId}`);
  }

  /**
   * Get a specific order
   */
  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    webhookSecret: string,
    payload: string,
    signature: string
  ): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }
}

export const createLemonSqueezyClient = () => {
  return new LemonSqueezyClient({
    apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
    storeId: process.env.LEMON_SQUEEZY_STORE_ID!,
    webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
  });
};
