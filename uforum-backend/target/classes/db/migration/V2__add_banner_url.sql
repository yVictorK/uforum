-- Add banner_url to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;
