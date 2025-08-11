-- Create database schema for EduGalaxy
-- This script creates the initial database structure

-- Enable UUID extension
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

-- Create common functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
