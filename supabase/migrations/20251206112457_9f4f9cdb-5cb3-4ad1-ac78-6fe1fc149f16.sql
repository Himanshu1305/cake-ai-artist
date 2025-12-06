-- Create a secure view for public featured images that only exposes safe columns
-- This prevents exposure of personal data like recipient_name, message, and prompt

CREATE OR REPLACE VIEW public.public_featured_images AS
SELECT 
  id,
  image_url,
  created_at,
  occasion_type
FROM public.generated_images
WHERE featured = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_featured_images TO anon, authenticated;

-- Update the RLS policies for founding_members to restrict INSERT to service_role
DROP POLICY IF EXISTS "System can insert founding members" ON public.founding_members;

-- Update the RLS policies for achievements to restrict INSERT to service_role
DROP POLICY IF EXISTS "System can create achievements" ON public.achievements;

-- Update the RLS policies for activity_feed to restrict INSERT to service_role
DROP POLICY IF EXISTS "System can create activity" ON public.activity_feed;

-- Update the RLS policies for reminder_logs to restrict INSERT to service_role
DROP POLICY IF EXISTS "System can insert reminder logs" ON public.reminder_logs;