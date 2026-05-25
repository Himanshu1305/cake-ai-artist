
DROP FUNCTION IF EXISTS public.get_public_cake(uuid);

CREATE FUNCTION public.get_public_cake(p_id uuid)
RETURNS TABLE(
  id uuid,
  image_url text,
  recipient_name text,
  message text,
  occasion_type text,
  audio_url text,
  audio_duration_seconds integer,
  created_at timestamp with time zone,
  sender_name text,
  share_group_id uuid,
  sibling_image_urls text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    gi.id,
    gi.image_url,
    gi.recipient_name,
    gi.message,
    gi.occasion_type,
    gi.audio_url,
    gi.audio_duration_seconds,
    gi.created_at,
    COALESCE(p.first_name, '') AS sender_name,
    gi.share_group_id,
    CASE
      WHEN gi.share_group_id IS NULL THEN ARRAY[gi.image_url]
      ELSE COALESCE(
        (SELECT array_agg(s.image_url ORDER BY (s.id = gi.id) DESC, s.created_at ASC)
         FROM public.generated_images s
         WHERE s.share_group_id = gi.share_group_id),
        ARRAY[gi.image_url]
      )
    END AS sibling_image_urls
  FROM public.generated_images gi
  LEFT JOIN public.profiles p ON p.id = gi.user_id
  WHERE gi.id = p_id;
$function$;
