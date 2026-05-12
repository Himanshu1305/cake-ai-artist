
CREATE OR REPLACE FUNCTION public.get_public_cake(p_id uuid)
RETURNS TABLE (
  id uuid,
  image_url text,
  recipient_name text,
  message text,
  occasion_type text,
  audio_url text,
  audio_duration_seconds integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, image_url, recipient_name, message, occasion_type,
         audio_url, audio_duration_seconds, created_at
  FROM public.generated_images
  WHERE id = p_id;
$$;

REVOKE ALL ON FUNCTION public.get_public_cake(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_cake(uuid) TO anon, authenticated;
