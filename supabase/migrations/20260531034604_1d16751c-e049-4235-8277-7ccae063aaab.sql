
UPDATE public.profiles p
SET country = sub.path_country,
    updated_at = now()
FROM (
  SELECT pv.user_id,
         mode() WITHIN GROUP (ORDER BY
           CASE
             WHEN pv.page_path LIKE '/india%'     THEN 'IN'
             WHEN pv.page_path LIKE '/uk%'        THEN 'UK'
             WHEN pv.page_path LIKE '/canada%'    THEN 'CA'
             WHEN pv.page_path LIKE '/australia%' THEN 'AU'
             WHEN pv.page_path = '/' OR pv.page_path LIKE '/usa%' THEN 'US'
           END
         ) AS path_country
  FROM public.page_visits pv
  WHERE pv.user_id IS NOT NULL
    AND (
      pv.page_path LIKE '/india%'
      OR pv.page_path LIKE '/uk%'
      OR pv.page_path LIKE '/canada%'
      OR pv.page_path LIKE '/australia%'
      OR pv.page_path LIKE '/usa%'
      OR pv.page_path = '/'
    )
  GROUP BY pv.user_id
) sub
WHERE p.id = sub.user_id
  AND p.country IS NULL
  AND sub.path_country IS NOT NULL;
