-- Re-grant EXECUTE on role-check helpers to anon.
-- These are SECURITY DEFINER and return only a boolean / role name.
-- They are referenced inside RLS policies on public-read tables
-- (cake_recipes, generated_images via public_featured_images view, etc.)
-- so revoking from anon broke all anonymous reads with
-- "permission denied for function has_role".
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO anon;