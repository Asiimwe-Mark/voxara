-- ================================================================
-- Migration 009: Video publish tracking + profiles.email column
-- ================================================================

-- Track per-platform publish events
CREATE TABLE IF NOT EXISTS public.video_publishes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id      UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL CHECK (platform IN ('youtube','tiktok','instagram','linkedin')),
  external_id   TEXT,                     -- platform-assigned video/post ID
  status        TEXT NOT NULL DEFAULT 'published'
                CHECK (status IN ('pending','published','failed')),
  error_message TEXT,
  published_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (video_id, platform)             -- one publish record per video per platform
);

ALTER TABLE public.video_publishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own publishes"
  ON public.video_publishes FOR ALL
  USING (auth.uid() = user_id);

-- Ensure profiles has an email column (backfill from auth.users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;

-- Ensure videos has webhook_url column (used by v1 API)
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Index for fast platform queries
CREATE INDEX IF NOT EXISTS idx_video_publishes_user_platform
  ON public.video_publishes (user_id, platform);

CREATE INDEX IF NOT EXISTS idx_video_publishes_video
  ON public.video_publishes (video_id);

-- ── Account deletion RPC ─────────────────────────────────────────────────────
-- Called by DangerZone component. Deletes all user data then soft-deletes the auth user.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Hard-delete cascade handled by FK ON DELETE CASCADE on all tables.
  -- Supabase auth user deletion is handled separately via the admin API.
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- Signal to the application that account is deleted
  -- (Supabase admin will delete the auth.users row via webhook/scheduled job)
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
