-- Add view_type tag for cake images and order top view last in share RPC
ALTER TABLE public.generated_images ADD COLUMN IF NOT EXISTS view_type text;

-- Best-effort backfill: for each share_group, the latest created_at row is most
-- likely the top view (which is generally the slowest to render).
WITH ranked AS (
  SELECT
    id,
    share_group_id,
    ROW_NUMBER() OVER (PARTITION BY share_group_id ORDER BY created_at ASC) AS rn,
    COUNT(*) OVER (PARTITION BY share_group_id) AS total
  FROM public.generated_images
  WHERE share_group_id IS NOT NULL AND view_type IS NULL
)
UPDATE public.generated_images gi
SET view_type = CASE
  WHEN r.rn = r.total THEN 'top'
  WHEN r.rn = 1 THEN 'front'
  ELSE 'side'
END
FROM ranked r
WHERE gi.id = r.id;

-- Replace get_public_cake to order siblings deterministically: sender's
-- selected first, top view last, others stable in between.
CREATE OR REPLACE FUNCTION public.get_public_cake(p_id uuid)
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
        (SELECT array_agg(s.image_url ORDER BY
            (s.id = gi.id) DESC,
            (s.view_type = 'top') ASC,
            COALESCE(s.view_type, '~') ASC,
            s.created_at ASC)
         FROM public.generated_images s
         WHERE s.share_group_id = gi.share_group_id),
        ARRAY[gi.image_url]
      )
    END AS sibling_image_urls
  FROM public.generated_images gi
  LEFT JOIN public.profiles p ON p.id = gi.user_id
  WHERE gi.id = p_id;
$function$;