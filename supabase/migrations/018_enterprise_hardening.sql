-- ============================================================
-- 018_enterprise_hardening.sql (FIXED)
--
-- Fixes applied vs original:
--   - marketplace_templates → video_templates (table doesn't exist)
--   - teams/team_members/team_invitations → organizations/* (these tables
--     don't exist; schema uses organizations/organization_members/invites)
--   - api_keys.rate_limit_per_minute removed (column never created in 007)
--   - idx_api_keys_active uses status column, not non-existent revoked_at
--   - pending_credit_purchases CREATE removed (already created in 014)
--   - Section 5 tables array cleaned up (removed non-existent tables)
--   - Section 12 cascade fixes updated to actual table names
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: Fix free-tier default credits in schema
-- ============================================================

ALTER TABLE public.profiles
  ALTER COLUMN credits SET DEFAULT 1;

UPDATE public.profiles
SET credits = 1, updated_at = NOW()
WHERE plan = 'free'
  AND credits = 3
  AND id NOT IN (SELECT DISTINCT user_id FROM public.videos);

-- ============================================================
-- SECTION 2: CHECK constraints (enum validation)
-- ============================================================

-- profiles.plan
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_plan;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_plan
  CHECK (plan IN ('free', 'pro', 'agency'));

-- profiles.credits — never negative
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_credits_non_negative;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_credits_non_negative
  CHECK (credits >= 0);

-- videos.status
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS chk_videos_status;
ALTER TABLE public.videos ADD CONSTRAINT chk_videos_status
  CHECK (status IN ('pending', 'processing', 'ready', 'failed', 'cancelled'));

-- credit_transactions.reason — known values
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS chk_credit_tx_reason;
ALTER TABLE public.credit_transactions ADD CONSTRAINT chk_credit_tx_reason
  CHECK (reason IN (
    'social_share','referral_given','referral_received',
    'video_render','top_up','admin_grant','subscription_renewal',
    'refund','expiry'
  ));

-- credit_transactions.amount — non-zero, bounded
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS chk_credit_tx_amount;
ALTER TABLE public.credit_transactions ADD CONSTRAINT chk_credit_tx_amount
  CHECK (amount != 0 AND amount BETWEEN -10000 AND 10000);

-- payment_subscriptions.status
ALTER TABLE public.payment_subscriptions DROP CONSTRAINT IF EXISTS chk_pay_sub_status;
ALTER TABLE public.payment_subscriptions ADD CONSTRAINT chk_pay_sub_status
  CHECK (status IN ('active','cancelled','past_due','trialing','paused','expired'));

-- FIX: was marketplace_templates (doesn't exist) → video_templates
ALTER TABLE public.video_templates DROP CONSTRAINT IF EXISTS chk_mkt_status;
ALTER TABLE public.video_templates ADD CONSTRAINT chk_mkt_status
  CHECK (status IN ('draft','published','pending','approved','rejected','archived'));

-- video_templates.price — non-negative
ALTER TABLE public.video_templates DROP CONSTRAINT IF EXISTS chk_mkt_price;
ALTER TABLE public.video_templates ADD CONSTRAINT chk_mkt_price
  CHECK (price >= 0);

-- auto_top_up_settings bounds
ALTER TABLE public.auto_top_up_settings DROP CONSTRAINT IF EXISTS chk_auto_topup_threshold;
ALTER TABLE public.auto_top_up_settings ADD CONSTRAINT chk_auto_topup_threshold
  CHECK (threshold BETWEEN 1 AND 1000);

ALTER TABLE public.auto_top_up_settings DROP CONSTRAINT IF EXISTS chk_auto_topup_amount;
ALTER TABLE public.auto_top_up_settings ADD CONSTRAINT chk_auto_topup_amount
  CHECK (top_up_amount IN (10, 25, 50, 100));

-- FIX: removed api_keys.rate_limit_per_minute constraint — column never exists
-- (api_keys table from 007 has: id, user_id, name, key_hash, key_preview,
--  permissions, last_used_at, expires_at, status, created_at, updated_at)

-- ============================================================
-- SECTION 3: NOT NULL constraints
-- ============================================================

-- profiles: email is always set by handle_new_user trigger
-- Guarded to avoid failure if any existing row has NULL email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email IS NULL LIMIT 1
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
  ELSE
    RAISE NOTICE '[018] Skipped email NOT NULL — some profiles have NULL email. '
                 'Backfill emails before re-running this constraint.';
  END IF;
END $$;

-- videos: status NOT NULL with default
ALTER TABLE public.videos ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.videos ALTER COLUMN status SET DEFAULT 'pending';

-- credit_transactions: all three core fields must be present
ALTER TABLE public.credit_transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.credit_transactions ALTER COLUMN amount  SET NOT NULL;
ALTER TABLE public.credit_transactions ALTER COLUMN reason  SET NOT NULL;

-- ============================================================
-- SECTION 4: Soft-delete (deleted_at) columns
-- ============================================================

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- FIX: removed ALTER TABLE public.teams — that table doesn't exist.
-- The schema uses public.organizations; add deleted_at there instead.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Hide soft-deleted videos from default RLS policies
DROP POLICY IF EXISTS "Users can view own videos" ON public.videos;
CREATE POLICY "Users can view own videos" ON public.videos
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
CREATE POLICY "Users can soft-delete own videos" ON public.videos
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SECTION 5: service_role bypass policies
-- FIX: removed non-existent tables; kept only real tables.
-- The EXCEPTION handler already suppresses undefined_table errors,
-- but a clean list avoids noise in logs.
-- ============================================================

DO $$ 
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'profiles','videos','credit_transactions','credit_purchases',
    'credit_packs','auto_top_up_settings','user_avatars','user_voices',
    'video_templates','template_purchases','creator_accounts',
    'social_accounts','social_shares','social_share_monthly_limits',
    'api_keys','webhook_endpoints','webhook_logs','video_publishes',
    'video_metrics','viewer_sessions','ab_experiments','ab_impressions',
    'seo_performance','payment_customers','payment_subscriptions',
    'payment_sessions','pending_credit_purchases','publishing_schedules',
    'organizations','organization_members','organization_subscriptions',
    'organization_invites'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    BEGIN
      EXECUTE format(
        'DROP POLICY IF EXISTS "Service role full access" ON public.%I',
        tbl
      );
      EXECUTE format(
        'CREATE POLICY "Service role full access" ON public.%I
           FOR ALL TO service_role USING (true) WITH CHECK (true)',
        tbl
      );
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ============================================================
-- SECTION 6: Missing updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
  tables_needing_trigger TEXT[] := ARRAY[
    'credit_purchases','auto_top_up_settings','user_avatars',
    'user_voices','video_templates','creator_accounts',
    'api_keys','payment_customers','payment_subscriptions',
    'payment_sessions'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_needing_trigger LOOP
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = tbl
          AND column_name  = 'updated_at'
      ) THEN
        EXECUTE format(
          'DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I;
           CREATE TRIGGER update_%s_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
          tbl, tbl, tbl, tbl
        );
      END IF;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ============================================================
-- SECTION 7: Missing columns from linting audit
-- ============================================================

-- videos: all already added in migration 010 — guarded with IF NOT EXISTS
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS youtube_id TEXT;
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE SET NULL;
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS voice_id UUID REFERENCES public.user_voices(id) ON DELETE SET NULL;

-- profiles: referral_code for fast lookup (pre-computed)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT GENERATED ALWAYS AS (
    UPPER(SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 8))
  ) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON public.profiles(referral_code);

-- credit_transactions: metadata column
ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

-- FIX: pending_credit_purchases is already created in migration 014.
-- Removed CREATE TABLE block that would conflict. If the metadata / updated_at
-- columns from 014 need to exist, they are already there.

-- ============================================================
-- SECTION 8: Hardened RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_credits  INT DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits INT;
BEGIN
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_credits IS NULL OR v_credits < p_credits THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET credits    = credits - p_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions(user_id, amount, reason)
  VALUES (p_user_id, -p_credits, 'video_render');

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_credits  INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_credits <= 0 THEN
    RAISE EXCEPTION 'p_credits must be positive, got %', p_credits;
  END IF;

  UPDATE public.profiles
  SET credits    = credits + p_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET credits = 1,   updated_at = NOW() WHERE plan = 'free';
  UPDATE public.profiles SET credits = 30,  updated_at = NOW() WHERE plan = 'pro';
  UPDATE public.profiles SET credits = 100, updated_at = NOW() WHERE plan = 'agency';
  RAISE NOTICE '[reset_monthly_credits] completed at %', NOW();
END;
$$;

-- ============================================================
-- SECTION 9: Partial/composite indexes for common queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_videos_user_ready
  ON public.videos(user_id, created_at DESC)
  WHERE status = 'ready' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_videos_processing
  ON public.videos(created_at)
  WHERE status = 'processing';

CREATE INDEX IF NOT EXISTS idx_videos_failed
  ON public.videos(user_id, created_at DESC)
  WHERE status = 'failed';

CREATE INDEX IF NOT EXISTS idx_credit_tx_monthly_share
  ON public.credit_transactions(user_id, created_at DESC)
  WHERE reason = 'social_share';

CREATE INDEX IF NOT EXISTS idx_credit_tx_referral
  ON public.credit_transactions(user_id, created_at DESC)
  WHERE reason IN ('referral_given','referral_received');

CREATE INDEX IF NOT EXISTS idx_pay_sub_active
  ON public.payment_subscriptions(user_id)
  WHERE status = 'active';

-- FIX: was marketplace_templates → video_templates
CREATE INDEX IF NOT EXISTS idx_mkt_published
  ON public.video_templates(created_at DESC)
  WHERE status = 'published';

-- FIX: api_keys has no revoked_at column → use status = 'active' instead
CREATE INDEX IF NOT EXISTS idx_api_keys_active
  ON public.api_keys(user_id)
  WHERE status = 'active';

-- ============================================================
-- SECTION 10: pg_cron monthly credit reset
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    PERFORM cron.schedule(
      'monthly-credit-reset',
      '0 0 1 * *',
      'SELECT public.reset_monthly_credits()'
    );
    RAISE NOTICE '[018] pg_cron monthly reset scheduled';
  ELSE
    RAISE NOTICE '[018] pg_cron not available — schedule reset_monthly_credits() via Inngest';
  END IF;
END $$;

-- ============================================================
-- SECTION 11: Handle new user trigger — updated for 1 credit
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, plan)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    1,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 12: Cascade fixes for FK references
-- FIX: teams/team_members/team_invitations don't exist.
-- The schema uses organizations/organization_members/organization_invites.
-- Those FKs are already set with ON DELETE CASCADE in migration 004.
-- Nothing to do here — kept as a no-op comment for traceability.
-- ============================================================

-- organization_members.organization_id already CASCADE (migration 004)
-- organization_invites.organization_id already CASCADE (migration 004)

COMMIT;

ANALYZE public.profiles;
ANALYZE public.videos;
ANALYZE public.credit_transactions;
