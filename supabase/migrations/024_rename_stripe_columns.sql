-- ============================================================
-- 020_rename_stripe_columns.sql
--
-- Rename legacy stripe_* columns to payment_* for provider-agnostic naming.
-- Runs after migration 018 which dropped the Stripe-specific tables.
-- ============================================================

BEGIN;

-- profiles table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles
      RENAME COLUMN stripe_customer_id TO payment_customer_id;
  END IF;
END $$;

-- payment_subscriptions table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'payment_subscriptions'
      AND column_name  = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE public.payment_subscriptions
      RENAME COLUMN stripe_subscription_id TO payment_subscription_id;
    ALTER TABLE public.payment_subscriptions
      RENAME COLUMN stripe_price_id TO payment_price_id;
  END IF;
END $$;

COMMIT;
