-- ======================================================
-- MARKETPLACE & SOCIAL
-- ======================================================

CREATE TABLE public.video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price INTEGER,
  preview_url TEXT,
  template_data JSONB,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- ✅ FIX (prevents duplicates per creator)
  UNIQUE (creator_id, name)
);

CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  platform TEXT,
  account_id TEXT,
  account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, platform, account_id)
);

-- ======================================================
-- RLS
-- ======================================================
ALTER TABLE public.video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates public read"
ON public.video_templates FOR SELECT USING (status = 'approved');

CREATE POLICY "Creator manage templates"
ON public.video_templates FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Users manage socials"
ON public.social_accounts FOR ALL USING (auth.uid() = user_id);