-- ======================================================
-- AI AVATARS & VOICE CLONING SCHEMA
-- ======================================================

-- User avatars (HeyGen, D-ID, Synthesia)
CREATE TABLE public.user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  avatar_model_id TEXT,
  heygen_task_id TEXT,
  provider TEXT DEFAULT 'heygen',
  polling_canceled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User cloned voices (ElevenLabs)
CREATE TABLE public.user_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sample_audio_url TEXT,
  voice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to videos table
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS voice_id UUID REFERENCES public.user_voices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS youtube_id TEXT;

-- ======================================================
-- RLS POLICIES
-- ======================================================
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own avatars" ON public.user_avatars
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own voices" ON public.user_voices
  FOR ALL USING (auth.uid() = user_id);

-- ======================================================
-- TRIGGERS
-- ======================================================
CREATE TRIGGER update_user_avatars_updated_at
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================================
-- INDEXES
-- ======================================================
CREATE INDEX idx_user_avatars_user_id ON public.user_avatars(user_id);
CREATE INDEX idx_user_avatars_status ON public.user_avatars(status);
CREATE INDEX idx_user_voices_user_id ON public.user_voices(user_id);
CREATE INDEX idx_user_voices_status ON public.user_voices(status);
CREATE INDEX idx_videos_avatar_id ON public.videos(avatar_id);
CREATE INDEX idx_videos_voice_id ON public.videos(voice_id);