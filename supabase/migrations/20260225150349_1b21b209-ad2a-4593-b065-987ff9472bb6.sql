DROP VIEW IF EXISTS public.public_blog_stats;
CREATE VIEW public.public_blog_stats 
WITH (security_invoker = true) AS
SELECT post_id, COUNT(*)::integer AS view_count
FROM public.blog_post_views
GROUP BY post_id;

GRANT SELECT ON public.public_blog_stats TO anon, authenticated;