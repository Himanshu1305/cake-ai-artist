-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create generated images table
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on generated_images
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Generated images policies
CREATE POLICY "Users can view their own images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON public.generated_images FOR DELETE
  USING (auth.uid() = user_id);

-- Create generation tracking table
CREATE TABLE public.generation_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS on generation_tracking
ALTER TABLE public.generation_tracking ENABLE ROW LEVEL SECURITY;

-- Generation tracking policies
CREATE POLICY "Users can view their own tracking"
  ON public.generation_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking"
  ON public.generation_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking"
  ON public.generation_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for generation_tracking updated_at
CREATE TRIGGER update_generation_tracking_updated_at
  BEFORE UPDATE ON public.generation_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to enforce image limit (20 per user)
CREATE OR REPLACE FUNCTION public.enforce_image_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  image_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO image_count
  FROM public.generated_images
  WHERE user_id = NEW.user_id;
  
  IF image_count >= 20 THEN
    -- Delete oldest image
    DELETE FROM public.generated_images
    WHERE id = (
      SELECT id FROM public.generated_images
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_image_limit_trigger
  BEFORE INSERT ON public.generated_images
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_image_limit();