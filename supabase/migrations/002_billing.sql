-- ======================================================
-- BILLING SCHEMA: STRIPE, SUBSCRIPTIONS, CREDIT PACKS
-- ======================================================

-- Stripe customers
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe subscriptions
CREATE TABLE public.stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit packs
CREATE TABLE public.credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_amount INTEGER NOT NULL,
  stripe_price_id TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credit purchases history
CREATE TABLE public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  credit_pack_id UUID REFERENCES public.credit_packs(id) ON DELETE SET NULL,
  credits_purchased INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto top-up settings
CREATE TABLE public.auto_top_up_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  threshold INTEGER DEFAULT 5,
  top_up_amount INTEGER DEFAULT 25,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- RLS POLICIES
-- ======================================================
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_top_up_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe customer" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credit purchases" ON public.credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own auto top-up" ON public.auto_top_up_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active credit packs" ON public.credit_packs
  FOR SELECT USING (active = true);

-- ======================================================
-- FUNCTIONS
-- ======================================================
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_credits INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_credits
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_credits INT DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INT;
BEGIN
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF v_current_credits IS NULL OR v_current_credits < p_credits THEN
    RETURN false;
  END IF;
  
  UPDATE public.profiles
  SET credits = credits - p_credits
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- TRIGGERS
-- ======================================================
CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON public.stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================================
-- SEED DATA: CREDIT PACKS
-- ======================================================
INSERT INTO public.credit_packs (name, credits, price_amount, active) VALUES
  ('10 Credits', 10, 900, true),
  ('25 Credits', 25, 1900, true),
  ('50 Credits', 50, 2900, true)
ON CONFLICT DO NOTHING;

-- ======================================================
-- INDEXES
-- ======================================================
CREATE INDEX idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX idx_stripe_subscriptions_user_id ON public.stripe_subscriptions(user_id);
CREATE INDEX idx_credit_purchases_user_id ON public.credit_purchases(user_id);