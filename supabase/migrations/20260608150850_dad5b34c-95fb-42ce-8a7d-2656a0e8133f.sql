-- Properly fix the Jun 6 public-read regression without requiring anon
-- callers to execute role-check helper functions.

-- Published recipes: public users should never need has_role() to read them.
DROP POLICY IF EXISTS "Anyone can view published recipes" ON public.cake_recipes;
CREATE POLICY "Public can view published recipes"
  ON public.cake_recipes
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can view all recipes"
  ON public.cake_recipes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin recipe writes should not be evaluated for anon requests.
DROP POLICY IF EXISTS "Admins can insert recipes" ON public.cake_recipes;
CREATE POLICY "Admins can insert recipes"
  ON public.cake_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update recipes" ON public.cake_recipes;
CREATE POLICY "Admins can update recipes"
  ON public.cake_recipes
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete recipes" ON public.cake_recipes;
CREATE POLICY "Admins can delete recipes"
  ON public.cake_recipes
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Public featured gallery view uses generated_images through RLS.
-- Allow visitors to see only rows deliberately marked featured.
DROP POLICY IF EXISTS "Anyone can view featured images" ON public.generated_images;
CREATE POLICY "Anyone can view featured images"
  ON public.generated_images
  FOR SELECT
  TO anon, authenticated
  USING (featured = true);

-- Admin image rules should not be evaluated for anon requests.
DROP POLICY IF EXISTS "Admins can view all images" ON public.generated_images;
CREATE POLICY "Admins can view all images"
  ON public.generated_images
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update any image" ON public.generated_images;
CREATE POLICY "Admins can update any image"
  ON public.generated_images
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete any image" ON public.generated_images;
CREATE POLICY "Admins can delete any image"
  ON public.generated_images
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Now anon no longer needs to execute these helpers for public pages.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;