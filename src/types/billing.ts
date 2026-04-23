export type PlanType = "free" | "pro" | "agency";

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  created_at: string;
}

export interface StripeSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_amount: number;
  stripe_price_id: string | null;
  active: boolean;
  created_at: string;
}

export interface CreditPurchase {
  id: string;
  user_id: string;
  credit_pack_id: string | null;
  credits_purchased: number;
  amount_paid: number;
  stripe_payment_intent_id: string | null;
  status: string;
  created_at: string;
}

export interface AutoTopUpSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  threshold: number;
  top_up_amount: number;
  updated_at: string;
}

export interface CreatorAccount {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  created_at: string;
}