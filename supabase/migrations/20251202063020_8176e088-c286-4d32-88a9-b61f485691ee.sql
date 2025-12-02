-- Create secure view for featured images (only exposes safe columns)
CREATE VIEW public.public_featured_images AS
SELECT 
  id,
  image_url,
  created_at,
  occasion_type
FROM public.generated_images
WHERE featured = true;

-- Grant public access to the view
GRANT SELECT ON public.public_featured_images TO anon;
GRANT SELECT ON public.public_featured_images TO authenticated;