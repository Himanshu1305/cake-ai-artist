
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS event_timezone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.party_guests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.party_guests;
