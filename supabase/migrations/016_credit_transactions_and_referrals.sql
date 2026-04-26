-- ============================================================
-- 016_credit_transactions_and_referrals.sql
--
-- Creates the credit_transactions table used by:
--   - awardSharingCredits()  (/api/credits/share)
--   - awardReferralCredits() (/api/referral)
--
-- Ensures add_credits RPC exists for atomic balance updates.
-- Reduces free tier from 3 → 1 credit on existing accounts.
-- ============================================================

-- 1. credit_transactions — audit log for every credit movement
CREATE TABLE IF NOT EXISTS credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,   -- 'social_share' | 'referral_given' | 'referral_received' | 'video_render' | 'top_up' | etc.
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON credit_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_reason
  ON credit_transactions(reason);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_reason_created
  ON credit_transactions(user_id, reason, created_at DESC);

-- Row-level security: users can only read their own transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/select freely (used by server-side RPC calls)
CREATE POLICY "Service role full access"
  ON credit_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- 2. Ensure add_credits RPC is atomic (SKIP if already created in 011)
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET credits = GREATEST(0, credits + p_credits),
      updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;
END;
$$;

-- 3. Correct the free tier: new signups get 1 credit (not 3).
--    Existing free users who have never generated a video keep their credits
--    as a goodwill gesture. Those who have used credits are unaffected.
--    Only reset accounts where credits = 3 (the old default) AND no videos exist.
UPDATE profiles
SET credits = 1, updated_at = NOW()
WHERE plan = 'free'
  AND credits = 3
  AND id NOT IN (
    SELECT DISTINCT user_id FROM videos
  );

-- 4. Function to get monthly sharing credits used (for cap enforcement)
CREATE OR REPLACE FUNCTION get_monthly_sharing_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND reason = 'social_share'
    AND created_at >= DATE_TRUNC('month', NOW());
  RETURN total;
END;
$$;
