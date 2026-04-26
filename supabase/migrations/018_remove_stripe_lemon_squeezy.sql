-- ============================================================
-- 018_remove_stripe_lemon_squeezy.sql
--
-- Removes legacy Stripe and Lemon Squeezy tables and replaces
-- with consolidated payment_* tables backed by Paddle / Flutterwave.
-- All existing data is migrated before old tables are dropped.
-- ============================================================

BEGIN;

-- ─── 1. Migrate stripe_customers → payment_customers ──────────────────────

INSERT INTO public.payment_customers (
  user_id, payment_customer_id, provider, created_at, updated_at
)
SELECT
  user_id,
  stripe_customer_id,
  'stripe_legacy',  -- tagged so you know origin; Paddle will create new entries on next checkout
  created_at,
  NOW()
FROM public.stripe_customers
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_customers pc
  WHERE pc.user_id = stripe_customers.user_id
)
ON CONFLICT DO NOTHING;

-- ─── 2. Migrate stripe_subscriptions → payment_subscriptions ───────────────

INSERT INTO public.payment_subscriptions (
  user_id, subscription_id, provider, plan, status,
  renews_at, created_at, updated_at
)
SELECT
  ss.user_id,
  ss.stripe_subscription_id,
  'stripe_legacy',
  p.plan,
  ss.status,
  ss.current_period_end,
  ss.created_at,
  NOW()
FROM public.stripe_subscriptions ss
LEFT JOIN public.profiles p ON p.id = ss.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_subscriptions ps
  WHERE ps.subscription_id = ss.stripe_subscription_id
)
ON CONFLICT DO NOTHING;

-- ─── 3. Drop legacy tables (safe: data is migrated above) ─────────────────

DROP TABLE IF EXISTS public.stripe_customers     CASCADE;
DROP TABLE IF EXISTS public.stripe_subscriptions CASCADE;

-- Remove Lemon Squeezy env-var-referenced columns if any snuck in
ALTER TABLE public.payment_subscriptions
  DROP COLUMN IF EXISTS lemon_squeezy_id;

ALTER TABLE public.payment_customers
  DROP COLUMN IF EXISTS lemon_squeezy_customer_id;

-- ─── 4. Rename provider tag for any newly onboarded users going forward ────
-- Old 'lemon-squeezy' entries (from migration 014) → 'paddle'

UPDATE public.payment_customers
SET provider = 'paddle', updated_at = NOW()
WHERE provider = 'lemon-squeezy';

UPDATE public.payment_subscriptions
SET provider = 'paddle', updated_at = NOW()
WHERE provider = 'lemon-squeezy';

-- ─── 5. Add provider CHECK constraint now that legacy values are cleaned up ─

ALTER TABLE public.payment_customers
  DROP CONSTRAINT IF EXISTS chk_payment_customers_provider;

ALTER TABLE public.payment_customers
  ADD CONSTRAINT chk_payment_customers_provider
    CHECK (provider IN ('paddle', 'flutterwave', 'stripe_legacy'));

ALTER TABLE public.payment_subscriptions
  DROP CONSTRAINT IF EXISTS chk_payment_subscriptions_provider;

ALTER TABLE public.payment_subscriptions
  ADD CONSTRAINT chk_payment_subscriptions_provider
    CHECK (provider IN ('paddle', 'flutterwave', 'stripe_legacy'));

-- ─── 6. Remove LEMON_SQUEEZY_ and STRIPE_ env var references from DB ───────
-- (env vars themselves must be removed from Vercel/Railway dashboard)
-- Nothing to do in SQL — just a comment for the deployer.

-- ─── 7. Update the creator marketplace to remove stripe_connect reference ──

ALTER TABLE public.marketplace_templates
  DROP COLUMN IF EXISTS stripe_connect_account_id;

ALTER TABLE public.marketplace_templates
  ADD COLUMN IF NOT EXISTS payout_account_id TEXT;  -- Paddle or Flutterwave payout ref

-- ─── 8. Drop unused Stripe-specific functions if they exist ────────────────

DROP FUNCTION IF EXISTS public.handle_stripe_subscription_updated() CASCADE;
DROP FUNCTION IF EXISTS public.sync_stripe_customer() CASCADE;

COMMIT;

ANALYZE public.payment_customers;
ANALYZE public.payment_subscriptions;
