export enum DefaultPermissions {
    VIEW_PROFILE = 'VIEW_PROFILE',
    UPDATE_PROFILE = 'UPDATE_PROFILE',
    VIEW_COURSES = 'VIEW_COURSES',
    ENROLL_COURSE = 'ENROLL_COURSE',
    VIEW_ASSIGNMENTS = 'VIEW_ASSIGNMENTS',
    SUBMIT_ASSIGNMENT = 'SUBMIT_ASSIGNMENT',
    VIEW_GRADES = 'VIEW_GRADES',
    VIEW_ANNOUNCEMENTS = 'VIEW_ANNOUNCEMENTS',
    CREATE_COURSE = 'CREATE_COURSE',
    UPDATE_COURSE = 'UPDATE_COURSE',
    DELETE_COURSE = 'DELETE_COURSE',
    MANAGE_ASSIGNMENTS = 'MANAGE_ASSIGNMENTS',
    GRADE_ASSIGNMENTS = 'GRADE_ASSIGNMENTS',
    VIEW_STUDENTS = 'VIEW_STUDENTS',
    MANAGE_ANNOUNCEMENTS = 'MANAGE_ANNOUNCEMENTS',
    VIEW_REPORTS = 'VIEW_REPORTS',
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_ROLES = 'MANAGE_ROLES',
    MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS',
    MANAGE_COURSES = 'MANAGE_COURSES',
    VIEW_ALL_REPORTS = 'VIEW_ALL_REPORTS',
    MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
    BACKUP_SYSTEM = 'BACKUP_SYSTEM',
    MENU_DASHBOARD = 'MENU_DASHBOARD',
    MENU_PROFILE = 'MENU_PROFILE',
    MENU_COURSES = 'MENU_COURSES',
    MENU_ASSIGNMENTS = 'MENU_ASSIGNMENTS',
    MENU_GRADES = 'MENU_GRADES',
    MENU_STUDENTS = 'MENU_STUDENTS',
    MENU_REPORTS = 'MENU_REPORTS',
    MENU_USERS = 'MENU_USERS',
    MENU_ROLES = 'MENU_ROLES',
    MENU_SETTINGS = 'MENU_SETTINGS',
    MENU_ANNOUNCEMENTS = 'MENU_ANNOUNCEMENTS'
}

export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin'
}

export const DEFAULT_PERMISSIONS_CONFIG = {
    [UserRole.STUDENT]: [
        DefaultPermissions.VIEW_PROFILE,
        DefaultPermissions.UPDATE_PROFILE,
        DefaultPermissions.VIEW_COURSES,
        DefaultPermissions.ENROLL_COURSE,
        DefaultPermissions.VIEW_ASSIGNMENTS,
        DefaultPermissions.SUBMIT_ASSIGNMENT,
        DefaultPermissions.VIEW_GRADES,
        DefaultPermissions.VIEW_ANNOUNCEMENTS,
        DefaultPermissions.MENU_DASHBOARD,
        DefaultPermissions.MENU_PROFILE,
        DefaultPermissions.MENU_COURSES,
        DefaultPermissions.MENU_ASSIGNMENTS,
        DefaultPermissions.MENU_GRADES
    ],
    [UserRole.TEACHER]: [
        DefaultPermissions.VIEW_PROFILE,
        DefaultPermissions.UPDATE_PROFILE,
        DefaultPermissions.VIEW_COURSES,
        DefaultPermissions.CREATE_COURSE,
        DefaultPermissions.UPDATE_COURSE,
        DefaultPermissions.DELETE_COURSE,
        DefaultPermissions.MANAGE_ASSIGNMENTS,
        DefaultPermissions.GRADE_ASSIGNMENTS,
        DefaultPermissions.VIEW_STUDENTS,
        DefaultPermissions.MANAGE_ANNOUNCEMENTS,
        DefaultPermissions.VIEW_REPORTS,
        DefaultPermissions.MENU_DASHBOARD,
        DefaultPermissions.MENU_PROFILE,
        DefaultPermissions.MENU_COURSES,
        DefaultPermissions.MENU_ASSIGNMENTS,
        DefaultPermissions.MENU_GRADES,
        DefaultPermissions.MENU_STUDENTS,
        DefaultPermissions.MENU_REPORTS,
        DefaultPermissions.MENU_ANNOUNCEMENTS
    ],
    [UserRole.ADMIN]: [
        DefaultPermissions.MANAGE_USERS,
        DefaultPermissions.MANAGE_ROLES,
        DefaultPermissions.MANAGE_PERMISSIONS,
        DefaultPermissions.MANAGE_COURSES,
        DefaultPermissions.MANAGE_ASSIGNMENTS,
        DefaultPermissions.VIEW_ALL_REPORTS,
        DefaultPermissions.MANAGE_SYSTEM_SETTINGS,
        DefaultPermissions.MANAGE_ANNOUNCEMENTS,
        DefaultPermissions.BACKUP_SYSTEM,
        DefaultPermissions.MENU_DASHBOARD,
        DefaultPermissions.MENU_PROFILE,
        DefaultPermissions.MENU_COURSES,
        DefaultPermissions.MENU_ASSIGNMENTS,
        DefaultPermissions.MENU_GRADES,
        DefaultPermissions.MENU_STUDENTS,
        DefaultPermissions.MENU_REPORTS,
        DefaultPermissions.MENU_USERS,
        DefaultPermissions.MENU_ROLES,
        DefaultPermissions.MENU_SETTINGS,
        DefaultPermissions.MENU_ANNOUNCEMENTS
    ]
} as const;

export type RoleType = keyof typeof DEFAULT_PERMISSIONS_CONFIG;

export const DEFAULT_ROLE = UserRole.STUDENT as RoleType;

export interface MenuConfig {
    title: string;
    description: string;
    route: string;
    permissionKey: string;
    sortOrder: number;
    parentKey?: string;
}

export const DEFAULT_MENUS_CONFIG: Record<string, MenuConfig> = {
    DASHBOARD: {
        title: 'Dashboard',
        description: 'Main dashboard and overview',
        route: '/dashboard',
        permissionKey: 'MENU_DASHBOARD',
        sortOrder: 1
    },
    PROFILE: {
        title: 'Profile',
        description: 'User profile management',
        route: '/profile',
        permissionKey: 'MENU_PROFILE',
        sortOrder: 2
    },
    COURSES: {
        title: 'Courses',
        description: 'Course management and enrollment',
        route: '/courses',
        permissionKey: 'MENU_COURSES',
        sortOrder: 3
    },
    ASSIGNMENTS: {
        title: 'Assignments',
        description: 'Assignment management and submission',
        route: '/assignments',
        permissionKey: 'MENU_ASSIGNMENTS',
        sortOrder: 4
    },
    GRADES: {
        title: 'Grades',
        description: 'Grade viewing and management',
        route: '/grades',
        permissionKey: 'MENU_GRADES',
        sortOrder: 5
    },
    STUDENTS: {
        title: 'Students',
        description: 'Student management and monitoring',
        route: '/students',
        permissionKey: 'MENU_STUDENTS',
        sortOrder: 6
    },
    REPORTS: {
        title: 'Reports',
        description: 'Reports and analytics',
        route: '/reports',
        permissionKey: 'MENU_REPORTS',
        sortOrder: 7
    },
    ANNOUNCEMENTS: {
        title: 'Announcements',
        description: 'Course and system announcements',
        route: '/announcements',
        permissionKey: 'MENU_ANNOUNCEMENTS',
        sortOrder: 8
    },
    ADMIN: {
        title: 'Administration',
        description: 'Administrative functions',
        route: '/admin',
        permissionKey: 'MENU_SETTINGS',
        sortOrder: 9
    },
    USERS: {
        title: 'Users',
        description: 'User management',
        route: '/admin/users',
        permissionKey: 'MENU_USERS',
        sortOrder: 10,
        parentKey: 'ADMIN'
    },
    ROLES: {
        title: 'Roles',
        description: 'Role and permission management',
        route: '/admin/roles',
        permissionKey: 'MENU_ROLES',
        sortOrder: 11,
        parentKey: 'ADMIN'
    },
    SETTINGS: {
        title: 'Settings',
        description: 'System settings and configuration',
        route: '/admin/settings',
        permissionKey: 'MENU_SETTINGS',
        sortOrder: 12,
        parentKey: 'ADMIN'
    }
};

export const DEFAULT_MENUS_BY_ROLE = {
    [UserRole.STUDENT]: ['DASHBOARD', 'PROFILE', 'COURSES', 'ASSIGNMENTS', 'GRADES'],
    [UserRole.TEACHER]: ['DASHBOARD', 'PROFILE', 'COURSES', 'ASSIGNMENTS', 'GRADES', 'STUDENTS', 'REPORTS', 'ANNOUNCEMENTS'],
    [UserRole.ADMIN]: ['DASHBOARD', 'PROFILE', 'COURSES', 'ASSIGNMENTS', 'GRADES', 'STUDENTS', 'REPORTS', 'ANNOUNCEMENTS', 'ADMIN', 'USERS', 'ROLES', 'SETTINGS']
} as const;
