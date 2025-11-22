-- Add memory/history fields to generated_images table
ALTER TABLE public.generated_images
ADD COLUMN recipient_name TEXT,
ADD COLUMN occasion_type TEXT,
ADD COLUMN occasion_date DATE;

-- Add index for querying by occasion_date (for future reminder feature)
CREATE INDEX idx_generated_images_occasion_date ON public.generated_images(occasion_date);

-- Add index for querying by user_id and occasion_date together
CREATE INDEX idx_generated_images_user_occasion ON public.generated_images(user_id, occasion_date);

COMMENT ON COLUMN public.generated_images.recipient_name IS 'Name of the person the cake was created for';
COMMENT ON COLUMN public.generated_images.occasion_type IS 'Type of occasion: birthday, anniversary, graduation, etc.';
COMMENT ON COLUMN public.generated_images.occasion_date IS 'The actual date of the celebration/occasion';