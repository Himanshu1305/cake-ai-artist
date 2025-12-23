-- Remove the dangerous policy that exposes ALL columns of featured images
DROP POLICY IF EXISTS "Anyone can view featured images" ON public.generated_images;