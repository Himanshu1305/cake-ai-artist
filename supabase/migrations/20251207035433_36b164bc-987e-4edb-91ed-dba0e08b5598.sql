CREATE OR REPLACE FUNCTION public.enforce_image_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  image_count INTEGER;
  user_is_admin BOOLEAN;
  user_is_premium BOOLEAN;
  image_limit INTEGER;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin'
  ) INTO user_is_admin;
  
  -- Check if user is premium
  SELECT COALESCE(is_premium, false) INTO user_is_premium
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Set limit based on role (admin: 100, premium: 30, free: 20)
  IF user_is_admin THEN
    image_limit := 100;
  ELSIF user_is_premium THEN
    image_limit := 30;
  ELSE
    image_limit := 20;
  END IF;
  
  -- Count current images
  SELECT COUNT(*) INTO image_count
  FROM public.generated_images
  WHERE user_id = NEW.user_id;
  
  -- If at limit, delete oldest image
  IF image_count >= image_limit THEN
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
$function$