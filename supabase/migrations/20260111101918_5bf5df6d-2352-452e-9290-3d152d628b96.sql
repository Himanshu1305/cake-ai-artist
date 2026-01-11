-- Create holiday_sales table for dynamic sale management
CREATE TABLE public.holiday_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT, -- NULL for global/US sales
  holiday_name TEXT NOT NULL,
  holiday_emoji TEXT NOT NULL DEFAULT '🎉',
  sale_label TEXT NOT NULL,
  banner_text TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holiday_sales ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active sales
CREATE POLICY "Anyone can read active holiday sales"
ON public.holiday_sales
FOR SELECT
USING (is_active = true AND now() >= start_date AND now() <= end_date);

-- Allow admins to manage all sales
CREATE POLICY "Admins can manage holiday sales"
ON public.holiday_sales
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index for efficient queries
CREATE INDEX idx_holiday_sales_active ON public.holiday_sales (country_code, is_active, start_date, end_date);

-- Trigger for updated_at
CREATE TRIGGER update_holiday_sales_updated_at
BEFORE UPDATE ON public.holiday_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Pre-populate with holidays for all countries

-- INDIA (IN) - Excluding Chinese New Year
INSERT INTO public.holiday_sales (country_code, holiday_name, holiday_emoji, sale_label, banner_text, start_date, end_date, is_active, priority) VALUES
('IN', 'Pongal/Makar Sankranti', '🪔', 'PONGAL SPECIAL!', '🪔 PONGAL SPECIAL - LIFETIME DEAL AT ₹999 - ENDS JAN 15', '2026-01-11T00:00:00Z', '2026-01-15T23:59:59Z', true, 10),
('IN', 'Republic Day', '🇮🇳', 'REPUBLIC DAY DEAL!', '🇮🇳 REPUBLIC DAY DEAL - LIFETIME ACCESS AT ₹999 - ENDS JAN 26', '2026-01-23T00:00:00Z', '2026-01-26T23:59:59Z', false, 10),
('IN', 'Valentine''s Day', '💕', 'VALENTINE''S SPECIAL!', '💕 VALENTINE''S SPECIAL - LIFETIME DEAL AT ₹999 - ENDS FEB 14', '2026-02-10T00:00:00Z', '2026-02-14T23:59:59Z', false, 10),
('IN', 'Holi', '🎨', 'HOLI CELEBRATION!', '🎨 HOLI CELEBRATION - LIFETIME ACCESS AT ₹999 - ENDS MAR 14', '2026-03-10T00:00:00Z', '2026-03-14T23:59:59Z', false, 10),
('IN', 'Gudi Padwa/Ugadi', '🌸', 'NEW YEAR SPECIAL!', '🌸 GUDI PADWA SPECIAL - LIFETIME DEAL AT ₹999 - ENDS MAR 31', '2026-03-28T00:00:00Z', '2026-03-31T23:59:59Z', false, 10);

-- AUSTRALIA (AU)
INSERT INTO public.holiday_sales (country_code, holiday_name, holiday_emoji, sale_label, banner_text, start_date, end_date, is_active, priority) VALUES
('AU', 'Australia Day', '🇦🇺', 'AUSTRALIA DAY DEAL!', '🇦🇺 AUSTRALIA DAY DEAL - LIFETIME ACCESS AT $49 - ENDS JAN 26', '2026-01-23T00:00:00Z', '2026-01-26T23:59:59Z', true, 10),
('AU', 'Valentine''s Day', '💕', 'VALENTINE''S SPECIAL!', '💕 VALENTINE''S SPECIAL - LIFETIME DEAL AT $49 - ENDS FEB 14', '2026-02-10T00:00:00Z', '2026-02-14T23:59:59Z', false, 10),
('AU', 'Easter', '🐣', 'EASTER SPECIAL!', '🐣 EASTER SPECIAL - LIFETIME ACCESS AT $49 - ENDS APR 21', '2026-04-17T00:00:00Z', '2026-04-21T23:59:59Z', false, 10);

-- UNITED KINGDOM (UK)
INSERT INTO public.holiday_sales (country_code, holiday_name, holiday_emoji, sale_label, banner_text, start_date, end_date, is_active, priority) VALUES
('UK', 'Valentine''s Day', '💕', 'VALENTINE''S SPECIAL!', '💕 VALENTINE''S SPECIAL - LIFETIME DEAL AT £39 - ENDS FEB 14', '2026-02-10T00:00:00Z', '2026-02-14T23:59:59Z', true, 10),
('UK', 'St. Patrick''s Day', '☘️', 'ST. PADDY''S DEAL!', '☘️ ST. PADDY''S DEAL - LIFETIME ACCESS AT £39 - ENDS MAR 17', '2026-03-14T00:00:00Z', '2026-03-17T23:59:59Z', false, 10),
('UK', 'Easter', '🐣', 'EASTER SPECIAL!', '🐣 EASTER SPECIAL - LIFETIME DEAL AT £39 - ENDS APR 21', '2026-04-17T00:00:00Z', '2026-04-21T23:59:59Z', false, 10),
('UK', 'King''s Birthday', '👑', 'ROYAL CELEBRATION!', '👑 ROYAL CELEBRATION - LIFETIME ACCESS AT £39 - ENDS JUN 15', '2026-06-12T00:00:00Z', '2026-06-15T23:59:59Z', false, 10);

-- CANADA (CA)
INSERT INTO public.holiday_sales (country_code, holiday_name, holiday_emoji, sale_label, banner_text, start_date, end_date, is_active, priority) VALUES
('CA', 'Valentine''s Day', '💕', 'VALENTINE''S SPECIAL!', '💕 VALENTINE''S SPECIAL - LIFETIME DEAL AT $49 CAD - ENDS FEB 14', '2026-02-10T00:00:00Z', '2026-02-14T23:59:59Z', true, 10),
('CA', 'Family Day', '👨‍👩‍👧', 'FAMILY DAY DEAL!', '👨‍👩‍👧 FAMILY DAY DEAL - LIFETIME ACCESS AT $49 CAD - ENDS FEB 17', '2026-02-14T00:00:00Z', '2026-02-17T23:59:59Z', false, 10),
('CA', 'St. Patrick''s Day', '☘️', 'ST. PADDY''S DEAL!', '☘️ ST. PADDY''S DEAL - LIFETIME DEAL AT $49 CAD - ENDS MAR 17', '2026-03-14T00:00:00Z', '2026-03-17T23:59:59Z', false, 10),
('CA', 'Easter', '🐣', 'EASTER SPECIAL!', '🐣 EASTER SPECIAL - LIFETIME ACCESS AT $49 CAD - ENDS APR 21', '2026-04-17T00:00:00Z', '2026-04-21T23:59:59Z', false, 10);

-- USA / GLOBAL (null country_code)
INSERT INTO public.holiday_sales (country_code, holiday_name, holiday_emoji, sale_label, banner_text, start_date, end_date, is_active, priority) VALUES
(NULL, 'Valentine''s Day', '💕', 'VALENTINE''S SPECIAL!', '💕 VALENTINE''S SPECIAL - LIFETIME DEAL AT $49 - ENDS FEB 14', '2026-02-10T00:00:00Z', '2026-02-14T23:59:59Z', true, 10),
(NULL, 'St. Patrick''s Day', '☘️', 'ST. PADDY''S DEAL!', '☘️ ST. PADDY''S DEAL - LIFETIME ACCESS AT $49 - ENDS MAR 17', '2026-03-14T00:00:00Z', '2026-03-17T23:59:59Z', false, 10),
(NULL, 'Easter', '🐣', 'EASTER SPECIAL!', '🐣 EASTER SPECIAL - LIFETIME DEAL AT $49 - ENDS APR 21', '2026-04-17T00:00:00Z', '2026-04-21T23:59:59Z', false, 10);