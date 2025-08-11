-- Create permissions table
CREATE TABLE
IF NOT EXISTS permissions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    name VARCHAR
(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR
(50) NOT NULL, -- e.g., 'user', 'course', 'admin'
    action VARCHAR
(50) NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX
IF NOT EXISTS idx_permissions_name ON permissions
(name);
CREATE INDEX
IF NOT EXISTS idx_permissions_resource_action ON permissions
(resource, action);
CREATE INDEX
IF NOT EXISTS idx_permissions_active ON permissions
(is_active);

-- Add trigger to update updated_at column
DROP TRIGGER IF EXISTS update_permissions_updated_at
ON permissions;
CREATE TRIGGER update_permissions_updated_at 
    BEFORE
UPDATE ON permissions 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
