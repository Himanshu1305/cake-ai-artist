-- 1. Recreate public_featured_images view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_featured_images;
CREATE VIEW public.public_featured_images 
WITH (security_invoker = true) AS
SELECT id, image_url, created_at, occasion_type
FROM public.generated_images
WHERE featured = true;

-- 2. Add missing RLS policies for reminder_logs
CREATE POLICY "Users can insert their own reminder logs"
ON public.reminder_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder logs"
ON public.reminder_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Add admin management policy for achievements
CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Add admin policies for subscriptions
CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add admin management policy for activity_feed
CREATE POLICY "Admins can manage activity feed"
ON public.activity_feed
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Add policies for referrals
CREATE POLICY "Referred users can view their referral"
ON public.referrals
FOR SELECT
TO authenticated
USING (referred_user_id = auth.uid());

CREATE POLICY "Admins can manage referrals"
ON public.referrals
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));