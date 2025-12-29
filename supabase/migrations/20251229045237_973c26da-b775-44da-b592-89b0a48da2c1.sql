-- Fix profiles table RLS policies
-- Drop existing SELECT policies and recreate as proper PERMISSIVE policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate as PERMISSIVE policies (default behavior - at least one must pass)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix blog_subscribers table RLS policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Admins can view all blog subscribers" ON public.blog_subscribers;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view their own subscription"
ON public.blog_subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all blog subscribers"
ON public.blog_subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));