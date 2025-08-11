-- Create role_permissions junction table for many-to-many relationship
CREATE TABLE
IF NOT EXISTS role_permissions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID, -- Who granted this permission (admin user id)
    
    -- Foreign key constraints
    CONSTRAINT fk_role_permissions_role FOREIGN KEY
(role_id) REFERENCES roles
(id) ON
DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY
(permission_id) REFERENCES permissions
(id) ON
DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate role-permission assignments
    CONSTRAINT uk_role_permission UNIQUE
(role_id, permission_id)
);

-- Create indexes for faster lookups
CREATE INDEX
IF NOT EXISTS idx_role_permissions_role_id ON role_permissions
(role_id);
CREATE INDEX
IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions
(permission_id);
CREATE INDEX
IF NOT EXISTS idx_role_permissions_granted_at ON role_permissions
(granted_at);
