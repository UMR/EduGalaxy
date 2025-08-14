-- Create user_permissions table
CREATE TABLE
IF NOT EXISTS user_permissions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    user_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID,

    CONSTRAINT fk_user_permissions_user_id 
        FOREIGN KEY
(user_id) REFERENCES users
(id) ON
DELETE CASCADE,
    CONSTRAINT fk_user_permissions_permission_id 
        FOREIGN KEY
(permission_id) REFERENCES permissions
(id) ON
DELETE CASCADE,
    CONSTRAINT fk_user_permissions_granted_by 
        FOREIGN KEY
(granted_by) REFERENCES users
(id) ON
DELETE
SET NULL
,
    CONSTRAINT uk_user_permission 
        UNIQUE
(user_id, permission_id)
);

-- Create indexes
CREATE INDEX
IF NOT EXISTS idx_user_permissions_user_id ON user_permissions
(user_id);
CREATE INDEX
IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions
(permission_id);

-- Drop role_permissions table if exists
DROP TABLE IF EXISTS role_permissions
CASCADE;
