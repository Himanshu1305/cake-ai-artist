
ALTER TABLE public.generated_images
  ADD COLUMN IF NOT EXISTS share_group_id uuid;

CREATE INDEX IF NOT EXISTS idx_generated_images_share_group
  ON public.generated_images (share_group_id)
  WHERE share_group_id IS NOT NULL;

WITH grouped AS (
  SELECT id,
    md5(
      coalesce(user_id::text,'') || '|' ||
      coalesce(recipient_name,'') || '|' ||
      coalesce(occasion_type,'') || '|' ||
      to_char(date_trunc('minute', created_at), 'YYYYMMDDHH24MI')
    ) AS group_key
  FROM public.generated_images
  WHERE share_group_id IS NULL
),
keys AS (
  SELECT DISTINCT group_key, gen_random_uuid() AS gid FROM grouped
)
UPDATE public.generated_images gi
SET share_group_id = k.gid
FROM grouped g
JOIN keys k ON k.group_key = g.group_key
WHERE gi.id = g.id;
