-- Migration: Rename achieved_at to joined_at and add completed_at to challenges_users table
-- Date: 2025-12-30

BEGIN;

-- Rename achieved_at column to joined_at
ALTER TABLE challenges_users
  RENAME COLUMN achieved_at TO joined_at;

-- Add completed_at column (nullable, to be set when challenge is completed)
ALTER TABLE challenges_users
  ADD COLUMN completed_at TIMESTAMPTZ NULL;

-- Update progress_percent to have default value of 0 if needed
ALTER TABLE challenges_users
  ALTER COLUMN progress_percent SET DEFAULT 0;

-- For existing records where progress_percent is 100, set completed_at to joined_at
-- (assuming they were completed at the time the record was created)
UPDATE challenges_users
SET completed_at = joined_at
WHERE progress_percent = 100 AND completed_at IS NULL;

COMMIT;
