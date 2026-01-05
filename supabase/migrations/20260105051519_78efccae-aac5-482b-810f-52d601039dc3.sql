-- Add policy for service role / edge functions to insert and update blog posts
CREATE POLICY "Service role can manage all posts" 
ON public.blog_posts 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);