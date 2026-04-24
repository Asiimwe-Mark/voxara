-- Migration: Social sharing credit system
-- Adds ability for free users to earn credits by sharing videos on social media

-- Table to track social shares
CREATE TABLE
IF NOT EXISTS social_shares
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  user_id UUID NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE,
  video_id UUID
NOT NULL REFERENCES videos
(id) ON
DELETE CASCADE,
  platform VARCHAR(50)
NOT NULL CHECK
(platform IN
('twitter', 'facebook', 'linkedin', 'instagram', 'tiktok')),
  share_url TEXT,
  credits_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  UNIQUE
(user_id, video_id, platform)
);

-- Table to track monthly social share credit limits per user
CREATE TABLE
IF NOT EXISTS social_share_monthly_limits
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  user_id UUID NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE,
  month DATE
NOT NULL, -- First day of the month
  credits_earned INTEGER DEFAULT 0,
  UNIQUE
(user_id, month)
);

-- Index for efficient queries
CREATE INDEX
IF NOT EXISTS idx_social_shares_user_id ON social_shares
(user_id);
CREATE INDEX
IF NOT EXISTS idx_social_shares_video_id ON social_shares
(video_id);
CREATE INDEX
IF NOT EXISTS idx_social_share_monthly_limits_user_month ON social_share_monthly_limits
(user_id, month);

-- Function to award credits for social share
CREATE OR REPLACE FUNCTION award_social_share_credits
(
  p_user_id UUID,
  p_video_id UUID,
  p_platform VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_month DATE;
  v_monthly_limit INTEGER := 5; -- Max social share credits per month
  v_credits_per_share INTEGER := 2;
  v_existing_share RECORD;
  v_monthly_earned INTEGER := 0;
BEGIN
  -- Get current month (first day)
  v_current_month := DATE_TRUNC
('month', CURRENT_DATE);

-- Check if user already shared this video on this platform
SELECT *
INTO v_existing_share
FROM social_shares
WHERE user_id = p_user_id AND video_id = p_video_id AND platform = p_platform;

IF v_existing_share IS NOT NULL THEN
    RAISE NOTICE 'User already shared this video on %', p_platform;
RETURN FALSE;
END
IF;

  -- Check monthly credit limit
  SELECT COALESCE(credits_earned, 0)
INTO v_monthly_earned
FROM social_share_monthly_limits
WHERE user_id = p_user_id AND month = v_current_month;

IF v_monthly_earned >= v_monthly_limit THEN
    RAISE NOTICE 'User reached monthly social share credit limit';
RETURN FALSE;
END
IF;

  -- Record the share
  INSERT INTO social_shares
    (user_id, video_id, platform, credits_awarded)
VALUES
    (p_user_id, p_video_id, p_platform, v_credits_per_share)
ON CONFLICT
(user_id, video_id, platform) DO NOTHING;

-- Update monthly limit tracking
INSERT INTO social_share_monthly_limits
    (user_id, month, credits_earned)
VALUES
    (p_user_id, v_current_month, v_credits_per_share)
ON CONFLICT
(user_id, month) 
  DO
UPDATE SET credits_earned = social_share_monthly_limits.credits_earned + v_credits_per_share;

-- Add credits to user profile
UPDATE profiles
  SET credits = credits + v_credits_per_share
  WHERE id = p_user_id;

RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get social share status for a video
CREATE OR REPLACE FUNCTION get_video_share_status
(
  p_user_id UUID,
  p_video_id UUID
) RETURNS TABLE
(
  platform VARCHAR,
  shared BOOLEAN,
  credits_awarded INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.platform,
        TRUE AS shared,
        s.credits_awarded
    FROM social_shares s
    WHERE s.user_id = p_user_id AND s.video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's remaining social share credits for current month
CREATE OR REPLACE FUNCTION get_remaining_social_share_credits
(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_current_month DATE;
  v_monthly_limit INTEGER := 5;
  v_monthly_earned INTEGER := 0;
  v_remaining INTEGER;
BEGIN
  v_current_month := DATE_TRUNC
('month', CURRENT_DATE);

SELECT COALESCE(credits_earned, 0)
INTO v_monthly_earned
FROM social_share_monthly_limits
WHERE user_id = p_user_id AND month = v_current_month;

v_remaining := v_monthly_limit - v_monthly_earned;
RETURN GREATEST(0, v_remaining);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;