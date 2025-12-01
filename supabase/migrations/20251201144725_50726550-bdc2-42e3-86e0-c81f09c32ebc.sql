-- Add month column to generation_tracking for monthly limit tracking
ALTER TABLE public.generation_tracking 
ADD COLUMN month integer;

-- Create unique index to ensure one record per user per month
CREATE UNIQUE INDEX generation_tracking_user_month_unique 
ON public.generation_tracking(user_id, year, month) 
WHERE month IS NOT NULL;