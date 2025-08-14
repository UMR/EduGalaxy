-- 006-alter-users.sql
-- Script to alter users table to remove role_id column
-- Note: This will permanently remove the role_id column and any existing role assignments

-- Step 1: Drop the foreign key constraint first (if exists)
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_role;

-- Step 2: Drop the index on role_id (if exists)
DROP INDEX IF EXISTS idx_users_role_id;

-- Step 3: Remove the role_id column from users table (if exists)
ALTER TABLE users DROP COLUMN IF EXISTS role_id;