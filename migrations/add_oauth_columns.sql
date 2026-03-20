-- Add OAuth columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS apple_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Make password optional (default empty string for OAuth-only users)
ALTER TABLE users 
  ALTER COLUMN password SET DEFAULT '';
