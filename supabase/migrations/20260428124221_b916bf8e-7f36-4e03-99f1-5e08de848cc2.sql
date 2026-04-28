CREATE POLICY "Anyone can view featured images"
  ON public.generated_images
  FOR SELECT
  TO anon, authenticated
  USING (featured = true);