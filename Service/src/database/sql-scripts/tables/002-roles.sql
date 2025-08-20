-- Create roles table
CREATE TABLE
IF NOT EXISTS roles
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    name VARCHAR
(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on role name for faster lookups
CREATE INDEX
IF NOT EXISTS idx_roles_name ON roles
(name);
CREATE INDEX
IF NOT EXISTS idx_roles_active ON roles
(is_active);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_roles_updated_at
ON roles;
CREATE TRIGGER update_roles_updated_at 
    BEFORE
UPDATE ON roles 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Insert default roles if they don't exist
INSERT INTO roles
    (name, description, is_active)
SELECT *
FROM (
    VALUES
        ('student', 'Student role with basic learning permissions', true),
        ('teacher', 'Teacher role with course management permissions', true),
        ('admin', 'Administrator role with full system access', true)
) AS v(name, description, is_active)
WHERE NOT EXISTS (SELECT 1
FROM roles
WHERE roles.name = v.name);
