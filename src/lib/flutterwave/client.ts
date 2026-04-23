import fetch from 'node-fetch';

export interface FlutterwaveConfig {
  apiKey: string;
  webhookSecret: string;
}

export class FlutterwaveClient {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.flutterwave.com/v3';

  constructor(config: FlutterwaveConfig) {
    if (!config.apiKey) throw new Error('FLUTTERWAVE_SECRET_KEY is required');
    if (!config.webhookSecret) throw new Error('FLUTTERWAVE_WEBHOOK_SECRET is required');
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Flutterwave API Error: ${JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(params: {
    amount: number;
    email: string;
    phoneNumber?: string;
    currency?: string;
    txRef: string;
    customData?: Record<string, any>;
    redirectUrl?: string;
    meta?: Record<string, any>;
  }) {
    const payload = {
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency || 'NGN',
      redirect_url: params.redirectUrl || '',
      customer: {
        email: params.email,
        phonenumber: params.phoneNumber,
      },
      meta: {
        ...params.customData,
        ...params.meta,
      },
      customizations: {
        title: 'voxara Payment',
        description: 'Pay for credits and subscriptions',
        logo: 'https://voxara.app/logo.png',
      },
    };

    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionId: string) {
    return this.request(`/transactions/${transactionId}/verify`);
  }

  /**
   * Get transaction details by reference
   */
  async getTransactionByRef(txRef: string) {
    return this.request(`/transactions/verify_by_reference?tx_ref=${txRef}`);
  }

  /**
   * Create a subscription plan
   */
  async createPlan(params: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    duration: number;
  }) {
    const payload = {
      amount: params.amount,
      name: params.name,
      interval: params.interval,
      duration: params.duration,
    };

    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(params: {
    planId: number;
    customerId: number;
    txRef: string;
  }) {
    const payload = {
      customer: params.customerId,
      plan: params.planId,
      tx_ref: params.txRef,
    };

    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update a subscription
   */
  async updateSubscription(subscriptionId: number, params: { status?: string }) {
    const payload = {
      status: params.status,
    };

    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: number) {
    return this.updateSubscription(subscriptionId, { status: 'cancelled' });
  }

  /**
   * Get a customer's transactions
   */
  async getCustomerTransactions(customerId: number) {
    return this.request(`/customers/${customerId}/transactions`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }
}

export const createFlutterwaveClient = () => {
  return new FlutterwaveClient({
    apiKey: process.env.FLUTTERWAVE_SECRET_KEY!,
    webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET!,
  });
};
