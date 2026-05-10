-- ============================================================
-- 021_billing_view_and_payment_fields.sql (FIXED)
--
-- Fixes applied vs original:
--
--   1. Billing VIEW: payment_sessions has no amount_paid, currency, or
--      provider_transaction_id columns (not defined in migration 014).
--      The view now only references columns that actually exist.
--      Both sides of the UNION cast id to TEXT for type compatibility.
--
--   2. RENAME COLUMN IF EXISTS is not valid syntax in PostgreSQL < 16.
--      Supabase typically runs PG 15.x, so both renames are wrapped in
--      DO blocks that check information_schema before executing.
--
--   3. creator_accounts originally used stripe_account_id (migration 006);
--      payment_account_id is the provider-agnostic name going forward.
-- ============================================================

BEGIN;

-- ─── 1. Billing view ────────────────────────────────────────────────────────
--
-- Columns available in credit_purchases after migration 014/023:
--   id, user_id, credit_pack_id, credits_purchased, amount_paid,
--   payment_intent_id, provider, status, created_at
--
-- Columns available in payment_sessions (migration 014):
--   id (BIGINT), user_id, provider, session_id, plan_type,
--   credits, status, metadata, created_at, updated_at

CREATE OR REPLACE VIEW public.billing AS
SELECT
  cp.id::TEXT                  AS id,
  cp.user_id,
  cp.amount_paid               AS amount,
  'USD'                        AS currency,
  cp.status,
  COALESCE(cp.provider, 'card') AS payment_method,
  cp.payment_intent_id         AS payment_charge_id,
  cp.created_at,
  p.email                      AS user_email
FROM public.credit_purchases cp
LEFT JOIN public.profiles p ON p.id = cp.user_id

UNION ALL

SELECT
  ps.session_id                AS id,
  ps.user_id,
  NULL::INTEGER                AS amount,
  'USD'                        AS currency,
  ps.status,
  ps.provider                  AS payment_method,
  ps.session_id                AS payment_charge_id,
  ps.created_at,
  p.email                      AS user_email
FROM public.payment_sessions ps
LEFT JOIN public.profiles p ON p.id = ps.user_id
WHERE ps.status = 'completed';

GRANT SELECT ON public.billing TO authenticated, service_role;

-- ─── 2. FIX: Rename stripe_payment_intent_id → payment_intent_id ─────────
-- Uses DO block because RENAME COLUMN IF EXISTS requires PG 16+.
-- Migration 014 may have already added payment_intent_id directly;
-- migration 023 also guards this. Skip if column was already renamed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'credit_purchases'
      AND column_name  = 'stripe_payment_intent_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'credit_purchases'
      AND column_name  = 'payment_intent_id'
  ) THEN
    ALTER TABLE public.credit_purchases
      RENAME COLUMN stripe_payment_intent_id TO payment_intent_id;
    RAISE NOTICE '[021] Renamed credit_purchases.stripe_payment_intent_id → payment_intent_id';
  ELSE
    RAISE NOTICE '[021] credit_purchases.stripe_payment_intent_id already renamed or missing — skipped';
  END IF;
END $$;

-- ─── 3. FIX: Rename stripe_account_id → payment_account_id ───────────────
-- Uses DO block for same PG 16+ reason.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'creator_accounts'
      AND column_name  = 'stripe_account_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'creator_accounts'
      AND column_name  = 'payment_account_id'
  ) THEN
    ALTER TABLE public.creator_accounts
      RENAME COLUMN stripe_account_id TO payment_account_id;
    RAISE NOTICE '[021] Renamed creator_accounts.stripe_account_id → payment_account_id';
  ELSE
    RAISE NOTICE '[021] creator_accounts.stripe_account_id already renamed or missing — skipped';
  END IF;
END $$;

COMMIT;
