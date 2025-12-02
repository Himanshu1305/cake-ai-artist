-- Create party_packs table
CREATE TABLE public.party_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cake_image_id UUID NOT NULL,
  invitation_url TEXT NOT NULL,
  thank_you_card_url TEXT NOT NULL,
  banner_url TEXT NOT NULL,
  cake_topper_url TEXT NOT NULL,
  place_cards_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT party_packs_cake_image_id_fkey FOREIGN KEY (cake_image_id) 
    REFERENCES public.generated_images(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.party_packs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own party packs"
ON public.party_packs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own party packs"
ON public.party_packs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own party packs"
ON public.party_packs
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for party pack items
INSERT INTO storage.buckets (id, name, public)
VALUES ('party-packs', 'party-packs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for party pack items
CREATE POLICY "Users can view party pack items"
ON storage.objects
FOR SELECT
USING (bucket_id = 'party-packs');

CREATE POLICY "Authenticated users can upload party pack items"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'party-packs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own party pack items"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'party-packs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);