-- 007-UserRole.sql
-- User-Role junction table for many-to-many relationship between users and roles
-- This allows users to have multiple roles

-- Drop the table if it exists (for clean recreation)
DROP TABLE IF EXISTS user_roles
CASCADE;

-- Create the UserRole junction table
CREATE TABLE user_roles
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,

    -- Ensure unique combination of user and role (no duplicate assignments)
    CONSTRAINT uk_user_roles_user_role UNIQUE(user_id, role_id)
);

-- Create indexes for better performance
CREATE INDEX
IF NOT EXISTS idx_user_roles_user_id ON user_roles
(user_id);
CREATE INDEX
IF NOT EXISTS idx_user_roles_role_id ON user_roles
(role_id);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at
ON user_roles;
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE
UPDATE ON user_roles
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Populate UserRole table with existing user-role assignments from temp table
-- (This will run if the temp table exists from the alter users script)
DO $$
BEGIN
    IF EXISTS (SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'temp_user_roles') THEN
    INSERT INTO user_roles
        (user_id, role_id)
    SELECT user_id, role_id
    FROM temp_user_roles;

    -- Drop the temporary table
    DROP TABLE temp_user_roles;

    RAISE NOTICE 'Migrated existing user-role assignments to user_roles table';
END
IF;
END $$;

-- UserRole table created successfully
-- The table now supports many-to-many relationship between users and roles
