-- Insert default roles
INSERT INTO roles
    (id, name, description, is_active)
VALUES
    (uuid_generate_v4(), 'student', 'Student role with basic learning permissions', true),
    (uuid_generate_v4(), 'teacher', 'Teacher role with course management permissions', true),
    (uuid_generate_v4(), 'admin', 'Administrator role with full system access', true)
ON CONFLICT
(name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions
    (id, name, description, resource, action, is_active)
VALUES
    -- Student permissions
    (uuid_generate_v4(), 'VIEW_PROFILE', 'View own profile', 'profile', 'read', true),
    (uuid_generate_v4(), 'UPDATE_PROFILE', 'Update own profile', 'profile', 'update', true),
    (uuid_generate_v4(), 'VIEW_COURSES', 'View available courses', 'course', 'read', true),
    (uuid_generate_v4(), 'ENROLL_COURSE', 'Enroll in courses', 'course', 'enroll', true),
    (uuid_generate_v4(), 'VIEW_ASSIGNMENTS', 'View assignments', 'assignment', 'read', true),
    (uuid_generate_v4(), 'SUBMIT_ASSIGNMENT', 'Submit assignments', 'assignment', 'submit', true),
    (uuid_generate_v4(), 'VIEW_GRADES', 'View own grades', 'grade', 'read', true),
    (uuid_generate_v4(), 'VIEW_ANNOUNCEMENTS', 'View announcements', 'announcement', 'read', true),

    -- Teacher permissions
    (uuid_generate_v4(), 'CREATE_COURSE', 'Create new courses', 'course', 'create', true),
    (uuid_generate_v4(), 'UPDATE_COURSE', 'Update course details', 'course', 'update', true),
    (uuid_generate_v4(), 'DELETE_COURSE', 'Delete courses', 'course', 'delete', true),
    (uuid_generate_v4(), 'MANAGE_ASSIGNMENTS', 'Create and manage assignments', 'assignment', 'manage', true),
    (uuid_generate_v4(), 'GRADE_ASSIGNMENTS', 'Grade student assignments', 'assignment', 'grade', true),
    (uuid_generate_v4(), 'VIEW_STUDENTS', 'View enrolled students', 'student', 'read', true),
    (uuid_generate_v4(), 'MANAGE_ANNOUNCEMENTS', 'Create and manage announcements', 'announcement', 'manage', true),
    (uuid_generate_v4(), 'VIEW_REPORTS', 'View teaching reports', 'report', 'read', true),

    -- Admin permissions
    (uuid_generate_v4(), 'MANAGE_USERS', 'Manage all users', 'user', 'manage', true),
    (uuid_generate_v4(), 'MANAGE_ROLES', 'Manage user roles', 'role', 'manage', true),
    (uuid_generate_v4(), 'MANAGE_PERMISSIONS', 'Manage permissions', 'permission', 'manage', true),
    (uuid_generate_v4(), 'MANAGE_COURSES', 'Manage all courses', 'course', 'manage', true),
    (uuid_generate_v4(), 'VIEW_ALL_REPORTS', 'View all system reports', 'report', 'manage', true),
    (uuid_generate_v4(), 'MANAGE_SYSTEM_SETTINGS', 'Manage system settings', 'system', 'manage', true),
    (uuid_generate_v4(), 'BACKUP_SYSTEM', 'Create system backups', 'system', 'backup', true)
ON CONFLICT
(name) DO NOTHING;
