-- Add anniversary_reminders column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN anniversary_reminders boolean DEFAULT true;

-- Create reminder_logs table to track sent reminders
CREATE TABLE public.reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  reminder_date date NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on reminder_logs
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for reminder_logs
CREATE POLICY "Users can view their own reminder logs"
  ON public.reminder_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert reminder logs"
  ON public.reminder_logs
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_reminder_logs_user_id ON public.reminder_logs(user_id);
CREATE INDEX idx_reminder_logs_sent_at ON public.reminder_logs(sent_at);
CREATE INDEX idx_reminder_logs_user_image ON public.reminder_logs(user_id, image_id, reminder_date);

-- Add comments
COMMENT ON COLUMN public.user_settings.anniversary_reminders IS 'Whether user wants to receive anniversary reminder emails';
COMMENT ON TABLE public.reminder_logs IS 'Tracks sent anniversary reminder emails to prevent duplicates';