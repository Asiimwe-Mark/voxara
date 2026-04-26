-- ============================================================
-- 017_enterprise_hardening.sql
--
-- Enterprise-grade hardening pass across ALL tables:
--
--   1.  Fix free-tier default credits (3 → 1) in schema
--   2.  Add CHECK constraints for enums & numeric bounds
--   3.  Add NOT NULL constraints where data is always required
--   4.  Add soft-delete (deleted_at) to videos, profiles, teams
--   5.  Add service_role bypass policies to every table
--   6.  Add missing updated_at triggers to tables that lacked them
--   7.  Add missing columns discovered during linting audit
--   8.  Harden all RPCs with explicit transaction safety
--   9.  Add partial/conditional indexes for common query patterns
--   10. Add pg_cron monthly credit reset job
--   11. Add webhook_url column to videos (used by generate-video)
--   12. Fix cascades on orphaned foreign keys
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: Fix free-tier default credits in schema
-- ============================================================

ALTER TABLE public.profiles
  ALTER COLUMN credits SET DEFAULT 1;

-- Correct any existing free accounts still at old default (3)
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

-- marketplace_templates.status
ALTER TABLE public.marketplace_templates DROP CONSTRAINT IF EXISTS chk_mkt_status;
ALTER TABLE public.marketplace_templates ADD CONSTRAINT chk_mkt_status
  CHECK (status IN ('draft','published','rejected','archived'));

-- marketplace_templates.price — non-negative
ALTER TABLE public.marketplace_templates DROP CONSTRAINT IF EXISTS chk_mkt_price;
ALTER TABLE public.marketplace_templates ADD CONSTRAINT chk_mkt_price
  CHECK (price >= 0);

-- auto_top_up_settings bounds
ALTER TABLE public.auto_top_up_settings DROP CONSTRAINT IF EXISTS chk_auto_topup_threshold;
ALTER TABLE public.auto_top_up_settings ADD CONSTRAINT chk_auto_topup_threshold
  CHECK (threshold BETWEEN 1 AND 1000);

ALTER TABLE public.auto_top_up_settings DROP CONSTRAINT IF EXISTS chk_auto_topup_amount;
ALTER TABLE public.auto_top_up_settings ADD CONSTRAINT chk_auto_topup_amount
  CHECK (top_up_amount IN (10, 25, 50, 100));

-- api_keys.rate_limit_per_minute
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS chk_api_key_rate_limit;
ALTER TABLE public.api_keys ADD CONSTRAINT chk_api_key_rate_limit
  CHECK (rate_limit_per_minute BETWEEN 1 AND 1000);

-- ============================================================
-- SECTION 3: NOT NULL constraints
-- ============================================================

-- profiles: email is always set by handle_new_user trigger
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

-- videos: user_id already NOT NULL — add status NOT NULL
ALTER TABLE public.videos ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.videos ALTER COLUMN status SET DEFAULT 'pending';

-- credit_transactions: all three core fields must be present
ALTER TABLE public.credit_transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.credit_transactions ALTER COLUMN amount SET NOT NULL;
ALTER TABLE public.credit_transactions ALTER COLUMN reason SET NOT NULL;

-- ============================================================
-- SECTION 4: Soft-delete (deleted_at) columns
-- ============================================================

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.teams
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
-- SECTION 5: service_role bypass policies (essential for
--            server-side admin operations via supabaseAdmin)
-- ============================================================

DO $$ 
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'profiles','videos','credit_transactions','credit_purchases',
    'stripe_customers','stripe_subscriptions','credit_packs',
    'auto_top_up_settings','user_avatars','user_voices',
    'teams','team_members','team_invitations','video_templates',
    'video_analytics','session_analytics','daily_metrics',
    'platform_metrics','user_metrics','marketplace_templates',
    'template_purchases','marketplace_reviews','api_keys',
    'api_usage','video_publishes','payment_customers',
    'payment_subscriptions','payment_sessions','payment_transactions',
    'webhook_logs','credit_transactions'
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
      -- Table doesn't exist yet, skip silently
      NULL;
    END;
  END LOOP;
END $$;

-- ============================================================
-- SECTION 6: Missing updated_at triggers
-- ============================================================

-- Ensure the trigger function exists (may have been created in 001)
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
    'user_voices','teams','team_members','marketplace_templates',
    'api_keys','payment_customers','payment_subscriptions',
    'payment_sessions','payment_transactions'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_needing_trigger LOOP
    BEGIN
      -- Check the table has an updated_at column before adding trigger
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

-- videos: webhook_url used by generate-video inngest function
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- videos: avatar_id referenced in render route
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE SET NULL;

-- videos: voice_id referenced in render route
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS voice_id UUID REFERENCES public.user_voices(id) ON DELETE SET NULL;

-- videos: youtube_id used by video-card publish
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS youtube_id TEXT;

-- profiles: referral_code for fast lookup (pre-computed)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT GENERATED ALWAYS AS (
    UPPER(SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 8))
  ) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON public.profiles(referral_code);

-- credit_transactions: metadata column (for social share & referral tracking)
ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

-- pending_credit_purchases table (used by Flutterwave auto-topup)
CREATE TABLE IF NOT EXISTS public.pending_credit_purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_pending  INTEGER NOT NULL CHECK (credits_pending > 0),
  tx_ref           TEXT NOT NULL UNIQUE,
  provider         TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','completed','expired','failed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

ALTER TABLE public.pending_credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pending purchases" ON public.pending_credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON public.pending_credit_purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pending_purchases_user_id
  ON public.pending_credit_purchases(user_id);

CREATE INDEX IF NOT EXISTS idx_pending_purchases_tx_ref
  ON public.pending_credit_purchases(tx_ref);

-- ============================================================
-- SECTION 8: Hardened RPCs
-- ============================================================

-- Atomic credit deduction with row-level lock
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
  -- Lock the row to prevent concurrent deductions
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

  -- Audit log
  INSERT INTO public.credit_transactions(user_id, amount, reason)
  VALUES (p_user_id, -p_credits, 'video_render');

  RETURN TRUE;
END;
$$;

-- Atomic credit addition
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

-- Monthly credit reset (called by pg_cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset free users to 1 credit
  UPDATE public.profiles
  SET credits = 1, updated_at = NOW()
  WHERE plan = 'free';

  -- Reset pro users to 30 credits
  UPDATE public.profiles
  SET credits = 30, updated_at = NOW()
  WHERE plan = 'pro';

  -- Reset agency users to 100 credits
  UPDATE public.profiles
  SET credits = 100, updated_at = NOW()
  WHERE plan = 'agency';

  RAISE NOTICE '[reset_monthly_credits] completed at %', NOW();
END;
$$;

-- ============================================================
-- SECTION 9: Partial/composite indexes for common queries
-- ============================================================

-- Ready videos only (dashboard query)
CREATE INDEX IF NOT EXISTS idx_videos_user_ready
  ON public.videos(user_id, created_at DESC)
  WHERE status = 'ready' AND deleted_at IS NULL;

-- Processing videos (polling query)
CREATE INDEX IF NOT EXISTS idx_videos_processing
  ON public.videos(created_at)
  WHERE status = 'processing';

-- Failed videos (retry query)
CREATE INDEX IF NOT EXISTS idx_videos_failed
  ON public.videos(user_id, created_at DESC)
  WHERE status = 'failed';

-- credit_transactions monthly sharing cap query
CREATE INDEX IF NOT EXISTS idx_credit_tx_monthly_share
  ON public.credit_transactions(user_id, created_at DESC)
  WHERE reason = 'social_share';

-- credit_transactions referral history
CREATE INDEX IF NOT EXISTS idx_credit_tx_referral
  ON public.credit_transactions(user_id, created_at DESC)
  WHERE reason IN ('referral_given','referral_received');

-- Active subscriptions lookup
CREATE INDEX IF NOT EXISTS idx_pay_sub_active
  ON public.payment_subscriptions(user_id)
  WHERE status = 'active';

-- Active marketplace templates (public listing)
CREATE INDEX IF NOT EXISTS idx_mkt_published
  ON public.marketplace_templates(created_at DESC)
  WHERE status = 'published';

-- API keys: active only
CREATE INDEX IF NOT EXISTS idx_api_keys_active
  ON public.api_keys(user_id)
  WHERE revoked_at IS NULL;

-- ============================================================
-- SECTION 10: pg_cron monthly credit reset
-- ============================================================

DO $$
BEGIN
  -- Only schedule if pg_cron extension is available
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    PERFORM cron.schedule(
      'monthly-credit-reset',
      '0 0 1 * *',  -- 00:00 on the 1st of every month
      $$SELECT public.reset_monthly_credits()$$
    );
    RAISE NOTICE '[017] pg_cron monthly reset scheduled';
  ELSE
    RAISE NOTICE '[017] pg_cron not available — schedule reset_monthly_credits() externally via Inngest or Supabase Edge Functions';
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
    1,       -- Free tier: 1 credit
    'free'
  )
  ON CONFLICT (id) DO NOTHING;  -- Idempotent: safe if trigger fires twice

  RETURN NEW;
END;
$$;

-- Re-attach trigger in case it was dropped
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 12: Cascade fixes for orphaned FK references
-- ============================================================

-- videos.user_id: already CASCADE — confirm
-- team_members: if team deleted, members should cascade
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_team_id_fkey;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- team_invitations: cascade on team delete
ALTER TABLE public.team_invitations
  DROP CONSTRAINT IF EXISTS team_invitations_team_id_fkey;

ALTER TABLE public.team_invitations
  ADD CONSTRAINT team_invitations_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

COMMIT;

-- Post-commit VACUUM to update stats after mass UPDATE
ANALYZE public.profiles;
ANALYZE public.videos;
ANALYZE public.credit_transactions;
