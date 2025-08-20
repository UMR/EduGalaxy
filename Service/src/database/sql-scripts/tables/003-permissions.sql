CREATE TABLE
IF NOT EXISTS permissions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    permission_key VARCHAR
(100) UNIQUE NOT NULL,
    name VARCHAR
(150) NOT NULL,
    description TEXT,
    type VARCHAR
(20) NOT NULL DEFAULT 'ACTION',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX
IF NOT EXISTS idx_permissions_key ON permissions
(permission_key);
CREATE INDEX
IF NOT EXISTS idx_permissions_type ON permissions
(type);
CREATE INDEX
IF NOT EXISTS idx_permissions_active ON permissions
(is_active);
DROP TRIGGER IF EXISTS update_permissions_updated_at
ON permissions;
CREATE TRIGGER update_permissions_updated_at 
    BEFORE
UPDATE ON permissions 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

INSERT INTO permissions
    (permission_key, name, description, type)
SELECT *
FROM (
    VALUES
        ('VIEW_PROFILE', 'View Profile', 'Ability to view own profile information', 'ACTION'),
        ('UPDATE_PROFILE', 'Update Profile', 'Ability to update own profile information', 'ACTION'),
        ('VIEW_COURSES', 'View Courses', 'Ability to view available courses', 'ACTION'),
        ('ENROLL_COURSE', 'Enroll in Course', 'Ability to enroll in courses', 'ACTION'),
        ('VIEW_ASSIGNMENTS', 'View Assignments', 'Ability to view course assignments', 'ACTION'),
        ('SUBMIT_ASSIGNMENT', 'Submit Assignment', 'Ability to submit assignments', 'ACTION'),
        ('VIEW_GRADES', 'View Grades', 'Ability to view own grades and results', 'ACTION'),
        ('VIEW_ANNOUNCEMENTS', 'View Announcements', 'Ability to view course announcements', 'ACTION'),
        ('CREATE_COURSE', 'Create Course', 'Ability to create new courses', 'ACTION'),
        ('UPDATE_COURSE', 'Update Course', 'Ability to modify course content and settings', 'ACTION'),
        ('DELETE_COURSE', 'Delete Course', 'Ability to delete courses', 'ACTION'),
        ('MANAGE_ASSIGNMENTS', 'Manage Assignments', 'Ability to create, edit, and manage assignments', 'ACTION'),
        ('GRADE_ASSIGNMENTS', 'Grade Assignments', 'Ability to grade and provide feedback on assignments', 'ACTION'),
        ('VIEW_STUDENTS', 'View Students', 'Ability to view enrolled students and their information', 'ACTION'),
        ('MANAGE_ANNOUNCEMENTS', 'Manage Announcements', 'Ability to create and manage course announcements', 'ACTION'),
        ('VIEW_REPORTS', 'View Reports', 'Ability to view course and student progress reports', 'ACTION'),
        ('MANAGE_USERS', 'Manage Users', 'Ability to create, edit, and delete user accounts', 'ACTION'),
        ('MANAGE_ROLES', 'Manage Roles', 'Ability to create and modify user roles', 'ACTION'),
        ('MANAGE_PERMISSIONS', 'Manage Permissions', 'Ability to assign and revoke permissions', 'ACTION'),
        ('MANAGE_COURSES', 'Manage Courses', 'Full administrative control over all courses', 'ACTION'),
        ('VIEW_ALL_REPORTS', 'View All Reports', 'Ability to view system-wide reports and analytics', 'ACTION'),
        ('MANAGE_SYSTEM_SETTINGS', 'Manage System Settings', 'Ability to configure system-wide settings', 'ACTION'),
        ('BACKUP_SYSTEM', 'Backup System', 'Ability to perform system backups and maintenance', 'ACTION'),
        ('MENU_DASHBOARD', 'Dashboard Menu', 'Access to dashboard menu and overview', 'MENU'),
        ('MENU_PROFILE', 'Profile Menu', 'Access to profile management menu', 'MENU'),
        ('MENU_COURSES', 'Courses Menu', 'Access to courses section and navigation', 'MENU'),
        ('MENU_ASSIGNMENTS', 'Assignments Menu', 'Access to assignments section', 'MENU'),
        ('MENU_GRADES', 'Grades Menu', 'Access to grades and results section', 'MENU'),
        ('MENU_STUDENTS', 'Students Menu', 'Access to student management section', 'MENU'),
        ('MENU_REPORTS', 'Reports Menu', 'Access to reports and analytics section', 'MENU'),
        ('MENU_USERS', 'Users Menu', 'Access to user management section', 'MENU'),
        ('MENU_ROLES', 'Roles Menu', 'Access to role management section', 'MENU'),
        ('MENU_SETTINGS', 'Settings Menu', 'Access to system settings section', 'MENU'),
        ('MENU_ANNOUNCEMENTS', 'Announcements Menu', 'Access to announcements section', 'MENU')
) AS v(permission_key, name, description, type)
WHERE NOT EXISTS (SELECT 1
FROM permissions
WHERE permissions.permission_key = v.permission_key);