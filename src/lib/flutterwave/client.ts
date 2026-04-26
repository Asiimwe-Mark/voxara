import crypto from 'crypto';

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
        ...(options.headers as Record<string, string> ?? {}),
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
    customData?: Record<string, unknown>;
    redirectUrl?: string;
    meta?: Record<string, unknown>;
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
      customizations: {
        title: 'Voxara',
        description: 'Credit Purchase',
      },
      meta: params.customData,
    };

    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Verify a transaction by ID
   */
  async verifyTransaction(transactionId: number) {
    return this.request(`/transactions/${transactionId}/verify`);
  }

  /**
   * Create a subscription plan
   */
  async createSubscription(params: {
    customerId: number;
    planId: number;
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
   * Verify webhook signature using HMAC-SHA256
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'utf8'),
      Buffer.from(signature.trim(), 'utf8')
    );
  }
}

export const createFlutterwaveClient = () => {
  return new FlutterwaveClient({
    apiKey: (process.env.FLUTTERWAVE_SECRET_KEY ?? (() => { throw new Error('FLUTTERWAVE_SECRET_KEY is required for Flutterwave payments'); })()),
    webhookSecret: (process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? (() => { throw new Error('FLUTTERWAVE_WEBHOOK_SECRET is required for Flutterwave webhooks'); })()),
  });
};
