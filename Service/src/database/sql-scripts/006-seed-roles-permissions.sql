-- Seed data for roles and permissions

-- Insert roles
INSERT INTO roles
    (id, name, description)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin', 'System administrator with full access'),
    ('550e8400-e29b-41d4-a716-446655440002', 'teacher', 'Teacher who can manage courses and students'),
    ('550e8400-e29b-41d4-a716-446655440003', 'student', 'Student who can enroll in courses and submit assignments')
ON CONFLICT
(name) DO NOTHING;

-- Insert permissions
INSERT INTO permissions
    (id, name, description, resource, action)
VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'user:create', 'Create new users', 'user', 'create'),
    ('660e8400-e29b-41d4-a716-446655440002', 'user:read', 'View user information', 'user', 'read'),
    ('660e8400-e29b-41d4-a716-446655440003', 'user:update', 'Update user information', 'user', 'update'),
    ('660e8400-e29b-41d4-a716-446655440004', 'user:delete', 'Delete users', 'user', 'delete'),
    ('660e8400-e29b-41d4-a716-446655440005', 'admin:manage_users', 'Full user management access', 'admin', 'manage_users'),
    ('660e8400-e29b-41d4-a716-446655440006', 'admin:manage_courses', 'Full course management access', 'admin', 'manage_courses'),
    ('660e8400-e29b-41d4-a716-446655440007', 'admin:view_analytics', 'View system analytics', 'admin', 'view_analytics'),
    ('660e8400-e29b-41d4-a716-446655440008', 'admin:system_config', 'Configure system settings', 'admin', 'system_config'),
    ('660e8400-e29b-41d4-a716-446655440009', 'student:enroll', 'Enroll in courses', 'student', 'enroll'),
    ('660e8400-e29b-41d4-a716-446655440010', 'student:view_courses', 'View available courses', 'student', 'view_courses'),
    ('660e8400-e29b-41d4-a716-446655440011', 'student:submit_assignment', 'Submit assignments', 'student', 'submit_assignment'),
    ('660e8400-e29b-41d4-a716-446655440012', 'teacher:create_course', 'Create new courses', 'teacher', 'create_course'),
    ('660e8400-e29b-41d4-a716-446655440013', 'teacher:manage_course', 'Manage course content', 'teacher', 'manage_course'),
    ('660e8400-e29b-41d4-a716-446655440014', 'teacher:grade_assignment', 'Grade student assignments', 'teacher', 'grade_assignment')
ON CONFLICT
(name) DO NOTHING;

-- Assign permissions to admin role (all permissions)
INSERT INTO role_permissions
    (role_id, permission_id)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440006'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440007'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440008'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440009'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440012'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440013'),
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440014')
ON CONFLICT
(role_id, permission_id) DO NOTHING;

-- Assign permissions to teacher role
INSERT INTO role_permissions
    (role_id, permission_id)
VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440012'),
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440013'),
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440014')
ON CONFLICT
(role_id, permission_id) DO NOTHING;

-- Assign permissions to student role
INSERT INTO role_permissions
    (role_id, permission_id)
VALUES
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009'),
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440011')
ON CONFLICT
(role_id, permission_id) DO NOTHING;
