-- Fix Security Definer View vulnerability
-- Drop the public_featured_images view that bypasses RLS
DROP VIEW IF EXISTS public.public_featured_images;

-- Add missing DELETE policies for generation_tracking table
CREATE POLICY "Users can delete their own tracking"
ON public.generation_tracking
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any tracking"
ON public.generation_tracking
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));