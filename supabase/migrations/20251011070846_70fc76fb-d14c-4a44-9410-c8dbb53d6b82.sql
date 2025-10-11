-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cake-images',
  'cake-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create storage policies for cake-images bucket
CREATE POLICY "Anyone can view cake images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cake-images');

CREATE POLICY "Authenticated users can upload cake images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cake-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own cake images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cake-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cake images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cake-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add featured column to generated_images table
ALTER TABLE public.generated_images
ADD COLUMN featured BOOLEAN DEFAULT false;

-- Add index for better performance when fetching featured images
CREATE INDEX idx_featured_images ON public.generated_images(featured, created_at DESC)
WHERE featured = true;