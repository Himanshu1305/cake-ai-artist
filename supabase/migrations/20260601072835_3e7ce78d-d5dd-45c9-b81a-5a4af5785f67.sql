
-- Party tasks: line-item budgets
ALTER TABLE public.party_tasks
  ADD COLUMN IF NOT EXISTS estimated_cost numeric,
  ADD COLUMN IF NOT EXISTS actual_cost numeric,
  ADD COLUMN IF NOT EXISTS currency text;

-- Party guests: richer RSVPs
ALTER TABLE public.party_guests
  ADD COLUMN IF NOT EXISTS plus_one_names jsonb,
  ADD COLUMN IF NOT EXISTS meal_preference text,
  ADD COLUMN IF NOT EXISTS custom_answers jsonb;

-- Parties: RSVP deadline + custom questions
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS rsvp_deadline date,
  ADD COLUMN IF NOT EXISTS custom_questions jsonb;

-- Public-by-slug read function (party + confirmed guest first names)
CREATE OR REPLACE FUNCTION public.get_party_public(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_party public.parties;
  v_attending jsonb;
BEGIN
  SELECT * INTO v_party FROM public.parties WHERE public_slug = p_slug LIMIT 1;
  IF v_party.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'first_name', split_part(g.name, ' ', 1),
      'plus_ones', COALESCE(g.plus_ones, 0)
    ) ORDER BY g.responded_at), '[]'::jsonb)
  INTO v_attending
  FROM public.party_guests g
  WHERE g.party_id = v_party.id AND g.rsvp_status = 'yes';

  RETURN jsonb_build_object(
    'id', v_party.id,
    'title', v_party.title,
    'occasion', v_party.occasion,
    'event_date', v_party.event_date,
    'event_timezone', v_party.event_timezone,
    'venue', v_party.venue,
    'city', v_party.city,
    'theme', v_party.theme,
    'invite_headline', v_party.invite_headline,
    'invite_message', v_party.invite_message,
    'invite_artwork_url', v_party.invite_artwork_url,
    'contact_email', v_party.contact_email,
    'contact_phone', v_party.contact_phone,
    'rsvp_deadline', v_party.rsvp_deadline,
    'public_slug', v_party.public_slug,
    'attending', v_attending,
    'attending_count', jsonb_array_length(v_attending)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_party_public(text) TO anon, authenticated;
