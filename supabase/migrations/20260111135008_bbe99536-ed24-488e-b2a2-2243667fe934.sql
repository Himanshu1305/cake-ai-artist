-- Add default fallback entries for when no holiday campaign is active
-- These have low priority (1) so holiday campaigns (priority 10) will always override them

-- Global default (for countries without specific defaults)
INSERT INTO public.holiday_sales (
  country_code, holiday_name, holiday_emoji, sale_label, 
  banner_text, start_date, end_date, is_active, priority
) VALUES 
(NULL, 'Exclusive Lifetime Deal', '✨', 'EXCLUSIVE DEAL!', 
 '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT $49 - LIMITED SPOTS REMAINING', 
 '2026-01-01', '2099-12-31', true, 1);

-- India default (INR pricing)
INSERT INTO public.holiday_sales (
  country_code, holiday_name, holiday_emoji, sale_label, 
  banner_text, start_date, end_date, is_active, priority
) VALUES 
('IN', 'Exclusive Lifetime Deal', '✨', 'EXCLUSIVE DEAL!', 
 '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT ₹999 - LIMITED SPOTS REMAINING', 
 '2026-01-01', '2099-12-31', true, 1);

-- UK default (GBP pricing)
INSERT INTO public.holiday_sales (
  country_code, holiday_name, holiday_emoji, sale_label, 
  banner_text, start_date, end_date, is_active, priority
) VALUES 
('UK', 'Exclusive Lifetime Deal', '✨', 'EXCLUSIVE DEAL!', 
 '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT £39 - LIMITED SPOTS REMAINING', 
 '2026-01-01', '2099-12-31', true, 1);

-- Australia default (AUD pricing)
INSERT INTO public.holiday_sales (
  country_code, holiday_name, holiday_emoji, sale_label, 
  banner_text, start_date, end_date, is_active, priority
) VALUES 
('AU', 'Exclusive Lifetime Deal', '✨', 'EXCLUSIVE DEAL!', 
 '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT A$79 - LIMITED SPOTS REMAINING', 
 '2026-01-01', '2099-12-31', true, 1);

-- Canada default (CAD pricing)
INSERT INTO public.holiday_sales (
  country_code, holiday_name, holiday_emoji, sale_label, 
  banner_text, start_date, end_date, is_active, priority
) VALUES 
('CA', 'Exclusive Lifetime Deal', '✨', 'EXCLUSIVE DEAL!', 
 '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT C$69 - LIMITED SPOTS REMAINING', 
 '2026-01-01', '2099-12-31', true, 1);

-- US default (USD pricing)
INSERT INTO public.holiday_sales (
  country_code, holiday_name, holiday_emoji, sale_label, 
  banner_text, start_date, end_date, is_active, priority
) VALUES 
('US', 'Exclusive Lifetime Deal', '✨', 'EXCLUSIVE DEAL!', 
 '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT $49 - LIMITED SPOTS REMAINING', 
 '2026-01-01', '2099-12-31', true, 1);