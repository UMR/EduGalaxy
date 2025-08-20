DROP TABLE IF EXISTS menus CASCADE;
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(50) NOT NULL,
    description VARCHAR(200) NULL,
    parent_id UUID NULL,
    route VARCHAR(200) NULL,
    permission_id UUID NULL,
    sort_order INT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_menu_user_created
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_menu_user_updated
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_menu_menu_parent
        FOREIGN KEY (parent_id)
        REFERENCES menus(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_menu_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
);

CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_permission_id ON menus(permission_id);
CREATE INDEX IF NOT EXISTS idx_menus_route ON menus(route);
CREATE INDEX IF NOT EXISTS idx_menus_active ON menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order);

DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DO $$
DECLARE
    dashboard_permission_id UUID;
    profile_permission_id UUID;
    courses_permission_id UUID;
    assignments_permission_id UUID;
    grades_permission_id UUID;
    students_permission_id UUID;
    reports_permission_id UUID;
    announcements_permission_id UUID;
    users_permission_id UUID;
    roles_permission_id UUID;
    settings_permission_id UUID;
    admin_menu_id UUID;
BEGIN
    SELECT id INTO dashboard_permission_id FROM permissions WHERE permission_key = 'MENU_DASHBOARD';
    SELECT id INTO profile_permission_id FROM permissions WHERE permission_key = 'MENU_PROFILE';
    SELECT id INTO courses_permission_id FROM permissions WHERE permission_key = 'MENU_COURSES';
    SELECT id INTO assignments_permission_id FROM permissions WHERE permission_key = 'MENU_ASSIGNMENTS';
    SELECT id INTO grades_permission_id FROM permissions WHERE permission_key = 'MENU_GRADES';
    SELECT id INTO students_permission_id FROM permissions WHERE permission_key = 'MENU_STUDENTS';
    SELECT id INTO reports_permission_id FROM permissions WHERE permission_key = 'MENU_REPORTS';
    SELECT id INTO announcements_permission_id FROM permissions WHERE permission_key = 'MENU_ANNOUNCEMENTS';
    SELECT id INTO users_permission_id FROM permissions WHERE permission_key = 'MENU_USERS';
    SELECT id INTO roles_permission_id FROM permissions WHERE permission_key = 'MENU_ROLES';
    SELECT id INTO settings_permission_id FROM permissions WHERE permission_key = 'MENU_SETTINGS';

    INSERT INTO menus (title, description, route, permission_id, sort_order, is_active)
    SELECT * FROM (
        VALUES
            ('Dashboard', 'Main dashboard and overview', '/dashboard', dashboard_permission_id, 1, true),
            ('Profile', 'User profile management', '/profile', profile_permission_id, 2, true),
            ('Courses', 'Course management and enrollment', '/courses', courses_permission_id, 3, true),
            ('Assignments', 'Assignment management and submission', '/assignments', assignments_permission_id, 4, true),
            ('Grades', 'Grade viewing and management', '/grades', grades_permission_id, 5, true),
            ('Students', 'Student management and monitoring', '/students', students_permission_id, 6, true),
            ('Reports', 'Reports and analytics', '/reports', reports_permission_id, 7, true),
            ('Announcements', 'Course and system announcements', '/announcements', announcements_permission_id, 8, true),
            ('Administration', 'Administrative functions', '/admin', settings_permission_id, 9, true)
    ) AS v(title, description, route, permission_id, sort_order, is_active)
    WHERE NOT EXISTS (
        SELECT 1 FROM menus WHERE menus.title = v.title AND menus.route = v.route
    );
    SELECT id INTO admin_menu_id FROM menus WHERE title = 'Administration' AND route = '/admin';

    INSERT INTO menus (title, description, parent_id, route, permission_id, sort_order, is_active)
    SELECT * FROM (
        VALUES
            ('Users', 'User management', admin_menu_id, '/admin/users', users_permission_id, 10, true),
            ('Roles', 'Role and permission management', admin_menu_id, '/admin/roles', roles_permission_id, 11, true),
            ('Settings', 'System settings and configuration', admin_menu_id, '/admin/settings', settings_permission_id, 12, true)
    ) AS v(title, description, parent_id, route, permission_id, sort_order, is_active)
    WHERE NOT EXISTS (
        SELECT 1 FROM menus WHERE menus.title = v.title AND menus.route = v.route AND menus.parent_id = v.parent_id
    );

END $$;
