-- =============================================
-- SECURITY FIX 1: blog_subscribers RLS
-- =============================================

-- Add unsubscribe token column for secure unsubscribe links
ALTER TABLE public.blog_subscribers 
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid();

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_unsubscribe_token 
ON public.blog_subscribers(unsubscribe_token);

-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can unsubscribe by email" ON public.blog_subscribers;

-- New policy: Update allowed only by owner or admins
CREATE POLICY "Unsubscribe by owner or admin"
ON public.blog_subscribers
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- =============================================
-- SECURITY FIX 2: blog_post_views RLS
-- =============================================

-- Drop the permissive SELECT policy that exposes session IDs/user agents
DROP POLICY IF EXISTS "Anyone can view blog stats" ON public.blog_post_views;

-- Create aggregated view for public stats (only post_id and count - no PII)
CREATE OR REPLACE VIEW public.public_blog_stats AS
SELECT 
  post_id,
  COUNT(*)::integer as view_count
FROM public.blog_post_views
GROUP BY post_id;

-- Add policy for admins to view full blog_post_views details
CREATE POLICY "Admins can view all blog views"
ON public.blog_post_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- SECURITY FIX 4: page_visits Rate Limiting
-- =============================================

-- Add index for efficient rate limit checks
CREATE INDEX IF NOT EXISTS idx_page_visits_session_visited 
ON public.page_visits(session_id, visited_at DESC);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_page_visit_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Skip if no session_id (allow anonymous tracking)
  IF NEW.session_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count visits from this session in the last 5 minutes
  SELECT COUNT(*) INTO recent_count
  FROM public.page_visits
  WHERE session_id = NEW.session_id
    AND visited_at > NOW() - INTERVAL '5 minutes';
  
  -- Allow max 30 page visits per session per 5 minutes
  IF recent_count > 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded for session';
  END IF;
  
  -- Check total visits from this session in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.page_visits
  WHERE session_id = NEW.session_id
    AND visited_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 100 page visits per session per hour
  IF recent_count > 100 THEN
    RAISE EXCEPTION 'Hourly rate limit exceeded for session';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS page_visits_rate_limit ON public.page_visits;
CREATE TRIGGER page_visits_rate_limit
  BEFORE INSERT ON public.page_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.check_page_visit_rate_limit();