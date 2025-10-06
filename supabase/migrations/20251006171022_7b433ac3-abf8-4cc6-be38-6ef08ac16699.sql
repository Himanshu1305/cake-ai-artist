-- Fix security warning: Add search_path to update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix security warning: Add search_path to enforce_image_limit function
CREATE OR REPLACE FUNCTION public.enforce_image_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  image_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO image_count
  FROM public.generated_images
  WHERE user_id = NEW.user_id;
  
  IF image_count >= 20 THEN
    -- Delete oldest image
    DELETE FROM public.generated_images
    WHERE id = (
      SELECT id FROM public.generated_images
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$;