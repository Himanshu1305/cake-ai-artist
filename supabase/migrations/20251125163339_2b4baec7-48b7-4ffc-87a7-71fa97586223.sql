-- Add admin RLS policies for profiles table
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin RLS policies for generated_images table
CREATE POLICY "Admins can view all images"
ON public.generated_images
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any image"
ON public.generated_images
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any image"
ON public.generated_images
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));