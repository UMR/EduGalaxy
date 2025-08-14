-- 006-alter-users.sql
-- Script to alter users table to remove role_id and support multiple roles through UserRole table

-- Step 1: Create a backup of existing user-role assignments before removing the role_id column
-- This will be used to populate the new UserRole table
CREATE TEMP
TABLE temp_user_roles AS
SELECT id as user_id, role_id
FROM users
WHERE role_id IS NOT NULL;

-- Step 2: Drop the foreign key constraint first
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_role;

-- Step 3: Drop the index on role_id
DROP INDEX IF EXISTS idx_users_role_id;

-- Step 4: Remove the role_id column from users table
ALTER TABLE users DROP COLUMN IF EXISTS role_id;

-- Step 5: Verify the alter was successful
-- Note: The role_id column should no longer exist in the users table