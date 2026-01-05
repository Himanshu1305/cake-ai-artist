-- Add blog_digest_emails column to user_settings (enabled by default)
ALTER TABLE user_settings 
ADD COLUMN blog_digest_emails BOOLEAN DEFAULT true;

-- Change marketing_emails default to true for new users
ALTER TABLE user_settings 
ALTER COLUMN marketing_emails SET DEFAULT true;