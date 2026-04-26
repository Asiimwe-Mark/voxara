/**
 * Billing Types
 * All types use payment_* naming — no Stripe-specific identifiers.
 */

export type PlanType = 'free' | 'pro' | 'agency';

export type PaymentProvider = 'paddle' | 'flutterwave' | 'stripe_legacy';

// ─── Payment Customers ────────────────────────────────────────────────────────

export interface PaymentCustomer {
  id: string;
  user_id: string;
  /** Provider-assigned customer ID (Paddle: ctm_xxx, Flutterwave: flw_cust_xxx) */
  payment_customer_id: string;
  provider: PaymentProvider;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use PaymentCustomer */
export type StripeCustomer = PaymentCustomer;

// ─── Payment Subscriptions ────────────────────────────────────────────────────

export interface PaymentSubscription {
  id: string;
  user_id: string;
  /** Provider-assigned subscription ID */
  payment_subscription_id: string;
  /** Provider-assigned price/plan ID */
  payment_price_id: string | null;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider: PaymentProvider;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use PaymentSubscription */
export type StripeSubscription = PaymentSubscription;

// ─── Credit Packs ─────────────────────────────────────────────────────────────

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_amount: number;
  payment_price_id: string | null;
  active: boolean;
  created_at: string;
}

// ─── Credit Purchases ─────────────────────────────────────────────────────────

export interface CreditPurchase {
  id: string;
  user_id: string;
  credit_pack_id: string | null;
  credits_purchased: number;
  amount_paid: number;
  /** Provider-assigned payment/transaction ID */
  payment_intent_id: string | null;
  provider: PaymentProvider;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

// ─── Auto Top-Up ──────────────────────────────────────────────────────────────

export interface AutoTopUpSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  threshold: number;
  top_up_amount: number;
  updated_at: string;
}

// ─── Creator Accounts ─────────────────────────────────────────────────────────

export interface CreatorAccount {
  id: string;
  user_id: string;
  /** Provider-assigned connected account ID */
  payment_account_id: string | null;
  provider: PaymentProvider;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  created_at: string;
}

// ─── Billing Admin View ───────────────────────────────────────────────────────

export interface BillingRecord {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_charge_id: string | null;
  created_at: string;
}

// ─── Payment Sessions ─────────────────────────────────────────────────────────

export interface PaymentSession {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  session_id: string;
  plan_type: PlanType | null;
  credits: number | null;
  amount_paid: number | null;
  currency: string | null;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  provider_transaction_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'expired';
  metadata?: Record<string, unknown>;
}
