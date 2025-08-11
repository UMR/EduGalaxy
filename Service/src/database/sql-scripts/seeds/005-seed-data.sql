-- Initial seed data for EduGalaxy
-- This script creates default users and sample data

-- Check if data already exists before inserting
DO $
$
BEGIN
    -- Only insert if users table is empty
    IF NOT EXISTS (SELECT 1
    FROM users LIMIT 1) THEN

    -- Insert admin user (password: admin123)
    INSERT INTO users
        (email, username, password, first_name, last_name, role, permissions, is_active, email_verified)
    VALUES
        (
            'admin@edugalaxy.com',
            'admin',
            '$2b$10$YQiQjLjJfkP9rQl.VZK8MeP7xXGJZKbE1Y1YQXqGxq.DXzJK1L3uO',
            'System',
            'Administrator',
            'admin',
            ARRAY
    ['user:read', 'user:write', 'user:delete', 'course:read', 'course:write', 'course:delete', 'enrollment:read', 'enrollment:write', 'enrollment:delete'],
            true,
            true
        );

    -- Insert teacher user (password: teacher123)
    INSERT INTO users
        (email, username, password, first_name, last_name, role, permissions, is_active, email_verified)
    VALUES
        (
            'teacher@edugalaxy.com',
            'teacher',
            '$2b$10$YQiQjLjJfkP9rQl.VZK8MeP7xXGJZKbE1Y1YQXqGxq.DXzJK1L3uO',
            'Jane',
            'Smith',
            'teacher',
            ARRAY
    ['course:read', 'course:write', 'enrollment:read', 'enrollment:write'],
            true,
            true
        );

    -- Insert student user (password: student123)
    INSERT INTO users
        (email, username, password, first_name, last_name, role, permissions, is_active, email_verified)
    VALUES
        (
            'student@edugalaxy.com',
            'student',
            '$2b$10$YQiQjLjJfkP9rQl.VZK8MeP7xXGJZKbE1Y1YQXqGxq.DXzJK1L3uO',
            'John',
            'Doe',
            'student',
            ARRAY
    ['course:read', 'enrollment:read'],
            true,
            true
        );

RAISE NOTICE 'Seed users created successfully';
    ELSE
        RAISE NOTICE 'Users already exist, skipping user seed data';
END
IF;

    -- Insert sample courses if none exist
    IF NOT EXISTS (SELECT 1
FROM courses LIMIT 1) THEN

-- Get teacher user ID for course instructor
DECLARE
            teacher_id UUID;
BEGIN
    SELECT id
    INTO teacher_id
    FROM users
    WHERE email = 'teacher@edugalaxy.com';

    -- Insert sample courses
    INSERT INTO courses
        (title, description, slug, instructor_id, category, difficulty_level, duration_hours, price, status, is_featured)
    VALUES
        (
            'Introduction to Programming',
            'Learn the fundamentals of programming with hands-on examples and practical exercises. Perfect for beginners who want to start their coding journey.',
            'intro-to-programming',
            teacher_id,
            'Programming',
            'beginner',
            40,
            99.99,
            'published',
            true
            ),
        (
            'Web Development with JavaScript',
            'Master modern web development techniques using JavaScript, HTML, and CSS. Build real-world projects and deploy them to the web.',
            'web-development-javascript',
            teacher_id,
            'Web Development',
            'intermediate',
            60,
            149.99,
            'published',
            true
            ),
        (
            'Database Design and SQL',
            'Learn how to design efficient databases and write powerful SQL queries. Covers both theory and practical implementation.',
            'database-design-sql',
            teacher_id,
            'Database',
            'intermediate',
            35,
            129.99,
            'published',
            false
            ),
        (
            'Advanced React Development',
            'Deep dive into React.js with advanced patterns, state management, and performance optimization techniques.',
            'advanced-react-development',
            teacher_id,
            'Frontend',
            'advanced',
            80,
            199.99,
            'draft',
            false
            );

    RAISE NOTICE 'Seed courses created successfully';
END;
    ELSE
        RAISE NOTICE 'Courses already exist, skipping course seed data';
END
IF;

    -- Create sample enrollment if none exist
    IF NOT EXISTS (SELECT 1
FROM enrollments LIMIT 1) THEN

DECLARE
            student_id UUID;
            course_id UUID;
BEGIN
    SELECT id
    INTO student_id
    FROM users
    WHERE email = 'student@edugalaxy.com';
    SELECT id
    INTO course_id
    FROM courses
    WHERE slug = 'intro-to-programming';

    IF student_id IS NOT NULL AND course_id IS NOT NULL THEN
    INSERT INTO enrollments
        (student_id, course_id, status, progress_percentage)
    VALUES
        (student_id, course_id, 'active', 25);

    RAISE NOTICE 'Sample enrollment created successfully';
END
IF;
        END;
    ELSE
        RAISE NOTICE 'Enrollments already exist, skipping enrollment seed data';
END
IF;

END $$;
