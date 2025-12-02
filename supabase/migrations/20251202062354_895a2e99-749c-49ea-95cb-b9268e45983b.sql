-- Fix RLS policies for security issues

-- 1. Fix founding_members table - restrict to own records and admin access
DROP POLICY IF EXISTS "Users can view all founding members" ON public.founding_members;

CREATE POLICY "Users can view their own founding member record"
ON public.founding_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all founding members"
ON public.founding_members
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix referrals table - change to authenticated role
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;

CREATE POLICY "Authenticated users can create their own referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Authenticated users can view their own referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

-- 3. Fix activity_feed table - only show anonymous activities publicly
DROP POLICY IF EXISTS "Anyone can view activity feed" ON public.activity_feed;

CREATE POLICY "Anyone can view anonymous activity feed"
ON public.activity_feed
FOR SELECT
TO public
USING (user_id IS NULL);

-- 4. Add admin access to feedback table
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));