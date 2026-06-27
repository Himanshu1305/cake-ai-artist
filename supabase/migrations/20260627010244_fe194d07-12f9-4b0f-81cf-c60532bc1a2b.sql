
CREATE TABLE public.party_pack_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL,
  tier TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  party_pack_id UUID REFERENCES public.party_packs(id) ON DELETE SET NULL,
  first_week_discount_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.party_pack_purchases TO authenticated;
GRANT ALL ON public.party_pack_purchases TO service_role;

ALTER TABLE public.party_pack_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own party pack purchases"
  ON public.party_pack_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages all party pack purchases"
  ON public.party_pack_purchases FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_party_pack_purchases_user ON public.party_pack_purchases(user_id);
