-- Seed users with role references

-- Insert default admin user if not exists
INSERT INTO users
    (id, email, username, password, first_name, last_name, role_id, is_active, email_verified)
VALUES
    (
        '770e8400-e29b-41d4-a716-446655440001',
        'admin@edugalaxy.com',
        'admin',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewHCCXj3mZA4E4Ze', -- admin123
        'System',
        'Administrator',
        '550e8400-e29b-41d4-a716-446655440001', -- admin role id
        true,
        true
)
ON CONFLICT
(email) DO NOTHING;

-- Insert default teacher user if not exists
INSERT INTO users
    (id, email, username, password, first_name, last_name, role_id, is_active, email_verified)
VALUES
    (
        '770e8400-e29b-41d4-a716-446655440002',
        'teacher@edugalaxy.com',
        'teacher',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewHCCXj3mZA4E4Ze', -- teacher123
        'John',
        'Teacher',
        '550e8400-e29b-41d4-a716-446655440002', -- teacher role id
        true,
        true
)
ON CONFLICT
(email) DO NOTHING;

-- Insert default student user if not exists
INSERT INTO users
    (id, email, username, password, first_name, last_name, role_id, is_active, email_verified)
VALUES
    (
        '770e8400-e29b-41d4-a716-446655440003',
        'student@edugalaxy.com',
        'student',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewHCCXj3mZA4E4Ze', -- student123
        'Jane',
        'Student',
        '550e8400-e29b-41d4-a716-446655440003', -- student role id
        true,
        true
)
ON CONFLICT
(email) DO NOTHING;
