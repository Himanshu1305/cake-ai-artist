
-- 1. Enhance handle_new_user to derive country from locale as a fallback
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
  v_country text;
  v_locale text;
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

  -- Country: explicit signup form value wins; otherwise derive from Google locale (e.g. en-GB -> GB -> UK)
  v_country := NULLIF(NEW.raw_user_meta_data->>'country', '');
  IF v_country IS NULL THEN
    v_locale := NULLIF(NEW.raw_user_meta_data->>'locale', '');
    IF v_locale IS NOT NULL AND position('-' in v_locale) > 0 THEN
      v_country := upper(split_part(v_locale, '-', 2));
      -- Map GB to UK to match our internal picker values
      IF v_country = 'GB' THEN v_country := 'UK'; END IF;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, country)
  VALUES (NEW.id, NEW.email, v_first, v_last, v_country);
  RETURN NEW;
END;
$function$;

-- 2. Backfill existing NULL-country profiles from their page_visits history
WITH ranked AS (
  SELECT
    pv.user_id,
    CASE WHEN upper(pv.country_code) = 'GB' THEN 'UK' ELSE upper(pv.country_code) END AS country,
    COUNT(*) AS visits,
    MAX(pv.visited_at) AS last_visit
  FROM public.page_visits pv
  JOIN public.profiles p ON p.id = pv.user_id
  WHERE (p.country IS NULL OR p.country = '')
    AND pv.country_code IS NOT NULL
    AND pv.country_code <> ''
  GROUP BY pv.user_id, CASE WHEN upper(pv.country_code) = 'GB' THEN 'UK' ELSE upper(pv.country_code) END
),
picked AS (
  SELECT DISTINCT ON (user_id) user_id, country
  FROM ranked
  ORDER BY user_id, visits DESC, last_visit DESC
)
UPDATE public.profiles p
SET country = picked.country
FROM picked
WHERE p.id = picked.user_id
  AND (p.country IS NULL OR p.country = '');
