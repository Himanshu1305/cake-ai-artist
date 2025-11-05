-- Add message and message_type columns to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS message_type TEXT CHECK (message_type IN ('ai', 'custom'));