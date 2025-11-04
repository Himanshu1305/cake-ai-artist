-- Allow users to update their own images
CREATE POLICY "Users can update their own images"
ON generated_images
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow anyone to view featured images for homepage carousel
CREATE POLICY "Anyone can view featured images"
ON generated_images
FOR SELECT
TO public
USING (featured = true);