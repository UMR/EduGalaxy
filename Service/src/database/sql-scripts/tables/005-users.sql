-- Drop the existing users table if it exists (for clean migration to RBAC)
DROP TABLE IF EXISTS users
CASCADE;

-- Users table with role reference
CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to roles table
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Create indexes (only if they don't exist)
CREATE INDEX
IF NOT EXISTS idx_users_email ON users
(email);
CREATE INDEX
IF NOT EXISTS idx_users_username ON users
(username);
CREATE INDEX
IF NOT EXISTS idx_users_role_id ON users
(role_id);
CREATE INDEX
IF NOT EXISTS idx_users_active ON users
(is_active);

-- Create trigger to update updated_at (only if it doesn't exist)
DROP TRIGGER IF EXISTS update_users_updated_at
ON users;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
