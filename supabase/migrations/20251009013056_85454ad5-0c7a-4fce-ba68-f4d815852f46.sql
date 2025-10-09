-- Set specific users as premium
UPDATE public.profiles
SET is_premium = true
WHERE email IN ('himanshu1305@gmail.com', 'usdvisionai@gmail.com');