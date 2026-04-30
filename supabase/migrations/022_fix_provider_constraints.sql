-- ================================================================
-- 022_fix_provider_constraints.sql
--
-- FUNCTIONAL FIXES:
--   1. All provider CHECK constraints missing 'paddle' — every Paddle
--      webhook insert fails with a CHECK violation at runtime.
--   2. payment_subscriptions status CHECK missing 'paused' — Paddle
--      can set subscriptions to 'paused' but the constraint rejects it.
--   3. Add 'canceled' + 'paused' status options to match Paddle API.
-- ================================================================

BEGIN;

-- ─── 1. payment_customers — add 'paddle' to provider CHECK ──────────────────

ALTER TABLE public.payment_customers
  DROP CONSTRAINT IF EXISTS payment_customers_provider_check;

ALTER TABLE public.payment_customers
  ADD CONSTRAINT payment_customers_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'flutterwave', 'lemon-squeezy'));

-- ─── 2. payment_subscriptions — add 'paddle' + 'paused' to CHECK ────────────

ALTER TABLE public.payment_subscriptions
  DROP CONSTRAINT IF EXISTS payment_subscriptions_provider_check;

ALTER TABLE public.payment_subscriptions
  ADD CONSTRAINT payment_subscriptions_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'flutterwave', 'lemon-squeezy'));

ALTER TABLE public.payment_subscriptions
  DROP CONSTRAINT IF EXISTS payment_subscriptions_status_check;

ALTER TABLE public.payment_subscriptions
  ADD CONSTRAINT payment_subscriptions_status_check
  CHECK (status IN ('active', 'canceled', 'cancelled', 'past_due', 'trialing', 'paused'));

-- ─── 3. payment_sessions — add 'paddle' ──────────────────────────────────────

ALTER TABLE public.payment_sessions
  DROP CONSTRAINT IF EXISTS payment_sessions_provider_check;

ALTER TABLE public.payment_sessions
  ADD CONSTRAINT payment_sessions_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'flutterwave', 'lemon-squeezy'));

-- ─── 4. credit_purchases — add 'paddle' ──────────────────────────────────────

ALTER TABLE public.credit_purchases
  DROP CONSTRAINT IF EXISTS credit_purchases_provider_check;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'credit_purchases'
      AND column_name  = 'provider'
  ) THEN
    ALTER TABLE public.credit_purchases
      ADD CONSTRAINT credit_purchases_provider_check
      CHECK (provider IN ('stripe', 'paddle', 'flutterwave', 'lemon-squeezy'));
  END IF;
END $$;

COMMIT;
