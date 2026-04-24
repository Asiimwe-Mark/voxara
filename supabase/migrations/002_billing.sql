-- ======================================================
-- BILLING (PADDLE + FLUTTERWAVE)
-- ======================================================

-- Payment customers
CREATE TABLE public.payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  paddle_customer_id TEXT UNIQUE,
  flutterwave_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE public.payment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('paddle', 'flutterwave')),
  provider_subscription_id TEXT UNIQUE,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit packs (FIXED)
CREATE TABLE public.credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- ✅ FIX
  credits INTEGER NOT NULL,
  price_amount INTEGER NOT NULL,
  provider_price_id TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases
CREATE TABLE public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  credit_pack_id UUID REFERENCES public.credit_packs ON DELETE SET NULL,
  credits_purchased INTEGER,
  amount_paid INTEGER,
  provider TEXT,
  provider_tx_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- RLS
-- ======================================================
ALTER TABLE public.payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own billing"
ON public.payment_customers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view subscriptions"
ON public.payment_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view purchases"
ON public.credit_purchases FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public view credit packs"
ON public.credit_packs FOR SELECT USING (active = true);

-- ======================================================
-- SEED DEFAULT PACKS (SAFE NOW)
-- ======================================================
INSERT INTO public.credit_packs (name, credits, price_amount, active)
VALUES
  ('10 Credits', 10, 900, true),
  ('25 Credits', 25, 1900, true),
  ('50 Credits', 50, 2900, true)
ON CONFLICT (name) DO NOTHING;