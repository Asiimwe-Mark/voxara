-- ============================================================
-- Migration 010: Missing columns and tables referenced in code
-- ============================================================

-- Add columns to user_avatars that are referenced in the codebase
ALTER TABLE public.user_avatars
  ADD COLUMN IF NOT EXISTS polling_canceled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'neutral';

-- Add avatar_id and voice_id to videos table (referenced in generate-video.ts)
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS voice_id UUID,
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_id TEXT;

-- Add avatar_model_id to user_avatars (referenced in generate-video.ts)
ALTER TABLE public.user_avatars
  ADD COLUMN IF NOT EXISTS avatar_model_id TEXT,
  ADD COLUMN IF NOT EXISTS heygen_task_id TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add user_voices table if missing
CREATE TABLE IF NOT EXISTS public.user_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  sample_audio_url TEXT,
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_voices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own voices" ON public.user_voices;
CREATE POLICY "Users can manage own voices" ON public.user_voices
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add credit_packs table for auto-top-up (referenced in auto-to-up.ts)
CREATE TABLE IF NOT EXISTS public.credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credits INT NOT NULL UNIQUE,
  price_amount INT NOT NULL,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Seed standard packs (use INSERT ... ON CONFLICT DO NOTHING for existing rows)
INSERT INTO public.credit_packs (name, credits, price_amount) VALUES
  ('Starter Pack', 10, 900),
  ('Value Pack', 25, 1900),
  ('Pro Pack', 50, 2900)
ON CONFLICT DO NOTHING;

-- Stripe customers table (referenced in checkout route)
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own stripe data" ON public.stripe_customers;
CREATE POLICY "Users can view own stripe data" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

-- Credit purchases history
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  credits_purchased INT NOT NULL,
  amount_paid INT NOT NULL DEFAULT 0,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own purchases" ON public.credit_purchases;
CREATE POLICY "Users view own purchases" ON public.credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Auto top-up settings
CREATE TABLE IF NOT EXISTS public.auto_top_up_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT FALSE,
  threshold INT DEFAULT 5,
  top_up_amount INT DEFAULT 25,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.auto_top_up_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own auto-top-up" ON public.auto_top_up_settings;
CREATE POLICY "Users manage own auto-top-up" ON public.auto_top_up_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Social accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  account_name TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own social accounts" ON public.social_accounts;
CREATE POLICY "Users manage own social accounts" ON public.social_accounts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Publishing schedules
CREATE TABLE IF NOT EXISTS public.publishing_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  title TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.publishing_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own schedules" ON public.publishing_schedules;
CREATE POLICY "Users manage own schedules" ON public.publishing_schedules
  USING (auth.uid() = user_id);

-- Add missing updated_at triggers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_voices_updated_at'
  ) THEN
    CREATE TRIGGER update_user_voices_updated_at
      BEFORE UPDATE ON public.user_voices
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
