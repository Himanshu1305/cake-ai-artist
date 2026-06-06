
-- 1. Storage: remove broad listing policies on public buckets (files remain accessible via public CDN URLs)
DROP POLICY IF EXISTS "Anyone can view cake images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read cake audio" ON storage.objects;
DROP POLICY IF EXISTS "Public can view party invite artwork" ON storage.objects;
DROP POLICY IF EXISTS "Users can view party pack items" ON storage.objects;

-- 2. SECURITY DEFINER function exposure: lock down EXECUTE per intended audience.

-- Trigger-only functions: no client should call directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_settings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_image_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_gallery_like_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_gallery_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_page_visit_rate_limit() FROM PUBLIC, anon, authenticated;

-- Authenticated-only helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.add_activity_feed(text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.add_activity_feed(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.link_session_visits_to_user(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.link_session_visits_to_user(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_available_spots() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_available_spots() TO authenticated;

-- Intentionally public RPCs (shared cake page, public party page, token-gated RSVP)
REVOKE EXECUTE ON FUNCTION public.get_public_cake(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_public_cake(uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_party_public(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_party_public(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_guest_by_token(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_guest_by_token(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.rsvp_by_token(text, text, integer, jsonb, text, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.rsvp_by_token(text, text, integer, jsonb, text, jsonb) TO anon, authenticated;
