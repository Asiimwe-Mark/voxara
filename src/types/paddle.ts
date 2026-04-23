/**
 * Paddle Payment Provider Type Definitions
 * Used for checkout sessions, subscriptions, customers, and webhooks
 */

export interface PaddleCustomer {
  id: string;
  email: string;
  name?: string;
  locale?: string;
  created_at: string;
  updated_at: string;
}

export interface PaddlePrice {
  id: string;
  product_id: string;
  description?: string;
  unit_amount: {
    amount: string;
    currency_code: string;
  };
  billing_cycle?: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  };
  trial_period?: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PaddleCheckoutSession {
  id: string;
  status: 'draft' | 'open' | 'completed' | 'expired' | 'failed';
  customer_id?: string;
  address_id?: string;
  business_id?: string;
  currency_code: string;
  customer_email?: string;
  discount_id?: string;
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
  custom_data?: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  return_url?: string;
  checkout_url: string;
}

export interface PaddleTransaction {
  id: string;
  customer_id?: string;
  address_id?: string;
  business_id?: string;
  subscription_id?: string;
  invoice_id?: string;
  origin: 'api' | 'checkout' | 'subscription' | 'web';
  billing_details?: {
    enable_checkout: boolean;
    purchase_order_number?: string;
    additional_information?: string;
  };
  items: Array<{
    price_id: string;
    quantity: number;
    proration?: {
      total_credit_amount: string;
      total_billing_amount: string;
      billing_period_start: string;
      billing_period_end: string;
    };
  }>;
  status: 'draft' | 'ready' | 'completed' | 'canceled' | 'failed';
  customer_ip_address?: string;
  receipt_number?: string;
  receipt_url?: string;
  billed_at?: string;
  finalized_at?: string;
  created_at: string;
  updated_at: string;
  currency_code: string;
  collection_mode: 'automatic' | 'manual';
  custom_data?: Record<string, any>;
  discount_id?: string;
  totals?: {
    subtotal: string;
    tax: string;
    total: string;
    credit_applied: string;
    balance: string;
    grand_total: string;
  };
}

export interface PaddleSubscription {
  id: string;
  status: 'active' | 'trialing' | 'paused' | 'past_due' | 'canceled' | 'expired';
  customer_id: string;
  address_id?: string;
  business_id?: string;
  collection_mode: 'automatic' | 'manual';
  currency_code: string;
  current_billing_period?: {
    starts_at: string;
    ends_at: string;
  };
  custom_data?: Record<string, any>;
  discount_id?: string;
  items: Array<{
    status: 'active' | 'trialing' | 'paused' | 'past_due' | 'canceled' | 'expired';
    price_id: string;
    quantity: number;
    previously_billed_at?: string;
    next_billed_at?: string;
    paused_at?: string;
    trial_dates?: {
      starts_at: string;
      ends_at: string;
    };
  }>;
  next_billed_at?: string;
  paused_at?: string;
  scheduled_change?: {
    action: 'cancel' | 'pause' | 'resume' | 'proration_date';
    effective_at: string;
    resume_at?: string;
    pause_mode?: 'void' | 'retain';
  };
  started_at: string;
  first_billed_at?: string;
  created_at: string;
  updated_at: string;
  trial_dates?: {
    starts_at: string;
    ends_at: string;
  };
  management_urls?: {
    update_payment_method: string;
    cancel: string;
  };
}

export interface PaddleEventNotification {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  status: 'delivered' | 'failed';
  last_attempt_at?: string;
  retry_attempts: number;
  next_retry_at?: string;
}

export interface PaddleWebhookEvent {
  event_id: string;
  event_type: PaddleEventType;
  occurred_at: string;
  notification_id: string;
  data: Record<string, any>;
}

export type PaddleEventType =
  | 'customer.created'
  | 'customer.updated'
  | 'address.created'
  | 'address.updated'
  | 'business.created'
  | 'business.updated'
  | 'product.created'
  | 'product.updated'
  | 'price.created'
  | 'price.updated'
  | 'discount.created'
  | 'discount.updated'
  | 'discount.deleted'
  | 'checkout.created'
  | 'checkout.updated'
  | 'checkout.completed'
  | 'transaction.created'
  | 'transaction.updated'
  | 'transaction.completed'
  | 'transaction.ready'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.trialing'
  | 'subscription.active'
  | 'subscription.paused'
  | 'subscription.past_due'
  | 'subscription.canceled'
  | 'subscription.resumed'
  | '*'; // wildcard for all events

export interface PaddleCheckoutCreateParams {
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
  customer_id?: string;
  customer_email?: string;
  currency_code?: string;
  discount_id?: string;
  business_id?: string;
  collection_mode?: 'automatic' | 'manual';
  billing_details?: {
    enable_checkout: boolean;
    purchase_order_number?: string;
    additional_information?: string;
  };
  custom_data?: Record<string, any>;
  return_url?: string;
}

export interface PaddleTransactionCreateParams {
  customer_id?: string;
  address_id?: string;
  business_id?: string;
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
  currency_code?: string;
  collection_mode?: 'automatic' | 'manual';
  discount_id?: string;
  custom_data?: Record<string, any>;
  billing_details?: {
    enable_checkout: boolean;
    purchase_order_number?: string;
    additional_information?: string;
  };
}

export interface PaddleSubscriptionCreateParams {
  customer_id: string;
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
  currency_code?: string;
  collection_mode?: 'automatic' | 'manual';
  billing_details?: {
    enable_checkout: boolean;
    purchase_order_number?: string;
    additional_information?: string;
  };
  custom_data?: Record<string, any>;
  discount_id?: string;
  proration_billing_mode?: 'full_cycle' | 'prorated_immediately' | 'prorated_next_billing_period';
  trial_period?: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  };
}

export interface PaddleEventMap {
  'transaction.completed': PaddleTransaction;
  'subscription.created': PaddleSubscription;
  'subscription.updated': PaddleSubscription;
  'subscription.canceled': PaddleSubscription;
  'subscription.paused': PaddleSubscription;
  'subscription.resumed': PaddleSubscription;
  'customer.created': PaddleCustomer;
  'customer.updated': PaddleCustomer;
}
