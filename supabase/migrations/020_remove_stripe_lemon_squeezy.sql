-- ============================================================
-- 020_remove_stripe_lemon_squeezy.sql (FIXED)
--
-- Fixes applied vs original:
--   - marketplace_templates → video_templates (sections 7)
--     The table created in 006 is video_templates, not marketplace_templates.
-- ============================================================

BEGIN;

-- ─── 1. Migrate stripe_customers → payment_customers ──────────────────────

INSERT INTO public.payment_customers (
  user_id, payment_customer_id, provider, created_at, updated_at
)
SELECT
  user_id,
  stripe_customer_id,
  'stripe_legacy',
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
  COALESCE(p.plan, 'free'),
  COALESCE(ss.status, 'active'),
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

-- ─── 3. Drop legacy tables ─────────────────────────────────────────────────

DROP TABLE IF EXISTS public.stripe_customers     CASCADE;
DROP TABLE IF EXISTS public.stripe_subscriptions CASCADE;

-- ─── 4. Clean up Lemon Squeezy columns if any exist ───────────────────────

ALTER TABLE public.payment_subscriptions
  DROP COLUMN IF EXISTS lemon_squeezy_id;

ALTER TABLE public.payment_customers
  DROP COLUMN IF EXISTS lemon_squeezy_customer_id;

-- ─── 5. Remap 'lemon-squeezy' provider tags → 'paddle' ────────────────────

UPDATE public.payment_customers
SET provider = 'paddle', updated_at = NOW()
WHERE provider = 'lemon-squeezy';

UPDATE public.payment_subscriptions
SET provider = 'paddle', updated_at = NOW()
WHERE provider = 'lemon-squeezy';

-- ─── 6. Provider CHECK constraints (will be widened again by 022) ──────────

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

-- ─── 7. FIX: was marketplace_templates → video_templates ──────────────────

ALTER TABLE public.video_templates
  DROP COLUMN IF EXISTS stripe_connect_account_id;

ALTER TABLE public.video_templates
  ADD COLUMN IF NOT EXISTS payout_account_id TEXT;

-- ─── 8. Drop unused Stripe-specific functions ──────────────────────────────

DROP FUNCTION IF EXISTS public.handle_stripe_subscription_updated() CASCADE;
DROP FUNCTION IF EXISTS public.sync_stripe_customer() CASCADE;

COMMIT;

ANALYZE public.payment_customers;
ANALYZE public.payment_subscriptions;
