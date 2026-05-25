ALTER TABLE public.generated_images
  ADD COLUMN IF NOT EXISTS audio_mime_type text;

DROP FUNCTION IF EXISTS public.get_public_cake(uuid);

CREATE FUNCTION public.get_public_cake(p_id uuid)
 RETURNS TABLE(id uuid, image_url text, recipient_name text, message text, occasion_type text, audio_url text, audio_duration_seconds integer, audio_mime_type text, created_at timestamp with time zone, sender_name text, share_group_id uuid, sibling_image_urls text[])
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
    COALESCE(
      gi.audio_url,
      (SELECT s.audio_url FROM public.generated_images s
        WHERE s.share_group_id = gi.share_group_id
          AND gi.share_group_id IS NOT NULL
          AND s.audio_url IS NOT NULL
        ORDER BY s.created_at ASC LIMIT 1)
    ) AS audio_url,
    COALESCE(
      gi.audio_duration_seconds,
      (SELECT s.audio_duration_seconds FROM public.generated_images s
        WHERE s.share_group_id = gi.share_group_id
          AND gi.share_group_id IS NOT NULL
          AND s.audio_url IS NOT NULL
        ORDER BY s.created_at ASC LIMIT 1)
    ) AS audio_duration_seconds,
    COALESCE(
      gi.audio_mime_type,
      (SELECT s.audio_mime_type FROM public.generated_images s
        WHERE s.share_group_id = gi.share_group_id
          AND gi.share_group_id IS NOT NULL
          AND s.audio_url IS NOT NULL
        ORDER BY s.created_at ASC LIMIT 1)
    ) AS audio_mime_type,
    gi.created_at,
    COALESCE(
      NULLIF(TRIM(p.first_name), ''),
      NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''),
      NULLIF(SPLIT_PART(p.email, '@', 1), ''),
      ''
    ) AS sender_name,
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

REVOKE ALL ON FUNCTION public.get_public_cake(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_cake(uuid) TO anon, authenticated;