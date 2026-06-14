CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_first text;
  v_last  text;
  v_full  text;
BEGIN
  v_full := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  v_first := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'first_name',''),
    NULLIF(NEW.raw_user_meta_data->>'given_name',''),
    NULLIF(split_part(v_full, ' ', 1), '')
  );
  v_last := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'last_name',''),
    NULLIF(NEW.raw_user_meta_data->>'family_name',''),
    NULLIF(NULLIF(regexp_replace(v_full, '^\S+\s*', ''), ''), ' ')
  );

  INSERT INTO public.profiles (id, email, first_name, last_name, country)
  VALUES (
    NEW.id,
    NEW.email,
    v_first,
    v_last,
    NEW.raw_user_meta_data ->> 'country'
  );
  RETURN NEW;
END;
$function$;