-- Create gallery_likes table for tracking likes on featured images
CREATE TABLE IF NOT EXISTS public.gallery_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, image_id)
);

-- Create gallery_comments table for comments on featured images
CREATE TABLE IF NOT EXISTS public.gallery_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery_image_stats table for storing like/comment counts
CREATE TABLE IF NOT EXISTS public.gallery_image_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL UNIQUE,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_image_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_likes
CREATE POLICY "Anyone can view likes" ON public.gallery_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.gallery_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.gallery_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for gallery_comments
CREATE POLICY "Anyone can view comments" ON public.gallery_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.gallery_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.gallery_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.gallery_comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any comment" ON public.gallery_comments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for gallery_image_stats
CREATE POLICY "Anyone can view stats" ON public.gallery_image_stats FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_likes_image_id ON public.gallery_likes(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_user_id ON public.gallery_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_image_id ON public.gallery_comments(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_user_id ON public.gallery_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_image_stats_image_id ON public.gallery_image_stats(image_id);

-- Function to update like count
CREATE OR REPLACE FUNCTION public.update_gallery_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.gallery_image_stats (image_id, like_count, comment_count)
    VALUES (NEW.image_id, 1, 0)
    ON CONFLICT (image_id) 
    DO UPDATE SET like_count = gallery_image_stats.like_count + 1, updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gallery_image_stats 
    SET like_count = GREATEST(0, like_count - 1), updated_at = now()
    WHERE image_id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update comment count
CREATE OR REPLACE FUNCTION public.update_gallery_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.gallery_image_stats (image_id, like_count, comment_count)
    VALUES (NEW.image_id, 0, 1)
    ON CONFLICT (image_id) 
    DO UPDATE SET comment_count = gallery_image_stats.comment_count + 1, updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gallery_image_stats 
    SET comment_count = GREATEST(0, comment_count - 1), updated_at = now()
    WHERE image_id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_like_count ON public.gallery_likes;
CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON public.gallery_likes
FOR EACH ROW EXECUTE FUNCTION public.update_gallery_like_count();

DROP TRIGGER IF EXISTS trigger_update_comment_count ON public.gallery_comments;
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON public.gallery_comments
FOR EACH ROW EXECUTE FUNCTION public.update_gallery_comment_count();