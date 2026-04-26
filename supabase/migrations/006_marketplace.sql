-- ======================================================
-- MARKETPLACE & SOCIAL PUBLISHING
-- ======================================================

-- Creator Stripe Connect accounts
CREATE TABLE public.creator_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_account_id TEXT UNIQUE,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Video templates marketplace
CREATE TABLE public.video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price INTEGER NOT NULL,
  preview_url TEXT,
  template_data JSONB,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Template purchases
CREATE TABLE public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.video_templates ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount_paid INTEGER,
  platform_fee INTEGER,
  creator_payout INTEGER,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Social accounts (YouTube, TikTok, Instagram, LinkedIn)
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Publishing schedules
CREATE TABLE public.publishing_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos ON DELETE CASCADE,
  platforms TEXT[] NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  caption TEXT,
  status TEXT DEFAULT 'pending',
  publish_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- RLS POLICIES
-- ======================================================
ALTER TABLE public.creator_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own creator account" ON public.creator_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved templates" ON public.video_templates
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Creators can manage own templates" ON public.video_templates
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Buyers can view own purchases" ON public.template_purchases
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can manage own social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own publishing schedules" ON public.publishing_schedules
  FOR ALL USING (auth.uid() = user_id);

-- ======================================================
-- TRIGGERS
-- ======================================================
CREATE TRIGGER update_creator_accounts_updated_at
  BEFORE UPDATE ON public.creator_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_templates_updated_at
  BEFORE UPDATE ON public.video_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publishing_schedules_updated_at
  BEFORE UPDATE ON public.publishing_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================================
-- INDEXES
-- ======================================================
CREATE INDEX idx_video_templates_creator_id ON public.video_templates(creator_id);
CREATE INDEX idx_video_templates_status ON public.video_templates(status);
CREATE INDEX idx_template_purchases_buyer_id ON public.template_purchases(buyer_id);
CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX idx_publishing_schedules_user_id ON public.publishing_schedules(user_id);
CREATE INDEX idx_publishing_schedules_status ON public.publishing_schedules(status);