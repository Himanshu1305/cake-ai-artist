
DROP POLICY IF EXISTS "Public can view by slug" ON public.parties;
DROP POLICY IF EXISTS "Anyone can read guest by token" ON public.party_guests;
DROP POLICY IF EXISTS "Anyone can RSVP via token update" ON public.party_guests;

CREATE OR REPLACE FUNCTION public.get_guest_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest public.party_guests;
  v_party public.parties;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RETURN NULL;
  END IF;
  SELECT * INTO v_guest FROM public.party_guests WHERE rsvp_token = p_token LIMIT 1;
  IF v_guest.id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT * INTO v_party FROM public.parties WHERE id = v_guest.party_id LIMIT 1;
  RETURN jsonb_build_object(
    'guest', jsonb_build_object(
      'id', v_guest.id,
      'party_id', v_guest.party_id,
      'name', v_guest.name,
      'email', v_guest.email,
      'rsvp_status', v_guest.rsvp_status,
      'plus_ones', v_guest.plus_ones,
      'plus_one_names', v_guest.plus_one_names,
      'meal_preference', v_guest.meal_preference,
      'custom_answers', v_guest.custom_answers
    ),
    'party', CASE WHEN v_party.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_party.id,
      'public_slug', v_party.public_slug,
      'title', v_party.title,
      'occasion', v_party.occasion,
      'event_date', v_party.event_date,
      'event_timezone', v_party.event_timezone,
      'venue', v_party.venue,
      'city', v_party.city,
      'theme', v_party.theme,
      'rsvp_deadline', v_party.rsvp_deadline,
      'custom_questions', v_party.custom_questions
    ) END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_guest_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.rsvp_by_token(
  p_token text,
  p_status text,
  p_plus_ones integer DEFAULT 0,
  p_plus_one_names jsonb DEFAULT NULL,
  p_meal_preference text DEFAULT NULL,
  p_custom_answers jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RETURN false;
  END IF;
  IF p_status NOT IN ('yes','no','maybe') THEN
    RETURN false;
  END IF;
  UPDATE public.party_guests
     SET rsvp_status = p_status,
         responded_at = now(),
         plus_ones = CASE WHEN p_status = 'yes' THEN GREATEST(0, LEAST(COALESCE(p_plus_ones,0), 10)) ELSE 0 END,
         plus_one_names = CASE WHEN p_status = 'yes' THEN p_plus_one_names ELSE plus_one_names END,
         meal_preference = CASE WHEN p_status = 'yes' THEN p_meal_preference ELSE meal_preference END,
         custom_answers = CASE WHEN p_status = 'yes' THEN p_custom_answers ELSE custom_answers END
   WHERE rsvp_token = p_token
   RETURNING id INTO v_id;
  RETURN v_id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rsvp_by_token(text, text, integer, jsonb, text, jsonb) TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can upload cake images" ON storage.objects;
CREATE POLICY "Users can upload cake images to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cake-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can delete party invite artwork" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update party invite artwork" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload party invite artwork" ON storage.objects;

CREATE POLICY "Owners can upload party invite artwork"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'party-invites'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Owners can update party invite artwork"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'party-invites'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Owners can delete party invite artwork"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'party-invites'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.founding_members;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.party_guests;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

ALTER VIEW public.public_featured_images SET (security_invoker = true);
