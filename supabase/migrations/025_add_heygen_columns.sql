-- Add missing HeyGen-related columns to user_avatars
ALTER TABLE public.user_avatars
  ADD COLUMN IF NOT EXISTS heygen_avatar_id TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS error TEXT;

CREATE INDEX IF NOT EXISTS idx_user_avatars_heygen_avatar_id ON public.user_avatars(heygen_avatar_id);