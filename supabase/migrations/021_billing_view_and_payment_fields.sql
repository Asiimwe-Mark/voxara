-- ============================================================
-- 021_billing_view_and_payment_fields.sql
--
-- Fixes three issues:
--   1. Admin routes query FROM 'billing' but no such table exists.
--      Creates a 'billing' VIEW over payment_sessions + credit_purchases.
--   2. Renames stripe_payment_intent_id → payment_intent_id in
--      credit_purchases and creator_accounts.
--   3. Renames stripe_account_id → payment_account_id in creator_accounts.
-- ============================================================

BEGIN;

-- ─── 1. Billing view (makes /api/admin/billing work without a new table) ────

CREATE OR REPLACE VIEW public.billing AS
SELECT
  cp.id,
  cp.user_id,
  cp.amount_paid                          AS amount,
  'USD'                                   AS currency,
  cp.status,
  'card'                                  AS payment_method,
  cp.payment_intent_id                    AS payment_charge_id,
  cp.created_at,
  p.email                                 AS user_email
FROM public.credit_purchases cp
LEFT JOIN public.profiles p ON p.id = cp.user_id

UNION ALL

SELECT
  ps.id,
  ps.user_id,
  ps.amount_paid                          AS amount,
  ps.currency,
  ps.status,
  ps.provider                             AS payment_method,
  ps.provider_transaction_id              AS payment_charge_id,
  ps.created_at,
  p.email                                 AS user_email
FROM public.payment_sessions ps
LEFT JOIN public.profiles p ON p.id = ps.user_id
WHERE ps.status = 'completed';

-- Grant read access to authenticated and service roles
GRANT SELECT ON public.billing TO authenticated, service_role;

-- ─── 2. Rename stripe_payment_intent_id → payment_intent_id ─────────────────

ALTER TABLE public.credit_purchases
  RENAME COLUMN IF EXISTS stripe_payment_intent_id TO payment_intent_id;

-- ─── 3. Rename stripe_account_id → payment_account_id ───────────────────────

ALTER TABLE public.creator_accounts
  RENAME COLUMN IF EXISTS stripe_account_id TO payment_account_id;

COMMIT;
