-- Allow anonymous users to update their own subscription via email
CREATE POLICY "Anyone can unsubscribe by email" 
ON public.blog_subscribers 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);