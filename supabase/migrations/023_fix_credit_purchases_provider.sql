-- ================================================================
-- 023_fix_credit_purchases_provider.sql
--
-- Adds 'provider' column to credit_purchases if not present,
-- and sets it to 'paddle' for all rows written by Paddle handlers.
-- The original schema (002_billing.sql) didn't have this column,
-- but migration 014 added it. This ensures backward compatibility.
-- ================================================================

BEGIN;

-- Add provider column if it doesn't exist yet
ALTER TABLE public.credit_purchases
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'paddle';

-- Add payment_intent_id if still named stripe_payment_intent_id
-- (migration 021 handles this, but this adds IF NOT EXISTS safety)
ALTER TABLE public.credit_purchases
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Backfill: if stripe_payment_intent_id exists and payment_intent_id is NULL,
-- copy values across before the rename in 021 takes effect
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'credit_purchases'
      AND column_name = 'stripe_payment_intent_id'
  ) THEN
    UPDATE public.credit_purchases
    SET payment_intent_id = stripe_payment_intent_id
    WHERE payment_intent_id IS NULL AND stripe_payment_intent_id IS NOT NULL;
  END IF;
END $$;

COMMIT;
