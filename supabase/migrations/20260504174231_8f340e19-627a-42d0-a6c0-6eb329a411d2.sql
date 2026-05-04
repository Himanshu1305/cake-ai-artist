
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS invite_artwork_url text,
  ADD COLUMN IF NOT EXISTS invite_artwork_meta jsonb,
  ADD COLUMN IF NOT EXISTS child_age int;

INSERT INTO storage.buckets (id, name, public)
VALUES ('party-invites', 'party-invites', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public can view party invite artwork"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'party-invites');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can upload party invite artwork"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'party-invites' AND auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update party invite artwork"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'party-invites' AND auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can delete party invite artwork"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'party-invites' AND auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
