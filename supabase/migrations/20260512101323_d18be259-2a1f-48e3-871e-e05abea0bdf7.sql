
ALTER TABLE public.generated_images
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cake-audio',
  'cake-audio',
  true,
  1048576,
  ARRAY['audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can read cake audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cake-audio');

CREATE POLICY "Users can upload their own cake audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cake-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own cake audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cake-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own cake audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cake-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
