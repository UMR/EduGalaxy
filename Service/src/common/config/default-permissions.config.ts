// Default permissions enum for easy access
export enum DefaultPermissions {
    // Student permissions
    VIEW_PROFILE = 'VIEW_PROFILE',
    UPDATE_PROFILE = 'UPDATE_PROFILE',
    VIEW_COURSES = 'VIEW_COURSES',
    ENROLL_COURSE = 'ENROLL_COURSE',
    VIEW_ASSIGNMENTS = 'VIEW_ASSIGNMENTS',
    SUBMIT_ASSIGNMENT = 'SUBMIT_ASSIGNMENT',
    VIEW_GRADES = 'VIEW_GRADES',
    VIEW_ANNOUNCEMENTS = 'VIEW_ANNOUNCEMENTS',

    // Teacher permissions
    CREATE_COURSE = 'CREATE_COURSE',
    UPDATE_COURSE = 'UPDATE_COURSE',
    DELETE_COURSE = 'DELETE_COURSE',
    MANAGE_ASSIGNMENTS = 'MANAGE_ASSIGNMENTS',
    GRADE_ASSIGNMENTS = 'GRADE_ASSIGNMENTS',
    VIEW_STUDENTS = 'VIEW_STUDENTS',
    MANAGE_ANNOUNCEMENTS = 'MANAGE_ANNOUNCEMENTS',
    VIEW_REPORTS = 'VIEW_REPORTS',

    // Admin permissions
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_ROLES = 'MANAGE_ROLES',
    MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS',
    MANAGE_COURSES = 'MANAGE_COURSES',
    VIEW_ALL_REPORTS = 'VIEW_ALL_REPORTS',
    MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
    BACKUP_SYSTEM = 'BACKUP_SYSTEM'
}

// Role enum for easy access
export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin'
}

// Default permissions configuration for each role using enum
export const DEFAULT_PERMISSIONS_CONFIG = {
    [UserRole.STUDENT]: [
        DefaultPermissions.VIEW_PROFILE,
        DefaultPermissions.UPDATE_PROFILE,
        DefaultPermissions.VIEW_COURSES,
        DefaultPermissions.ENROLL_COURSE,
        DefaultPermissions.VIEW_ASSIGNMENTS,
        DefaultPermissions.SUBMIT_ASSIGNMENT,
        DefaultPermissions.VIEW_GRADES,
        DefaultPermissions.VIEW_ANNOUNCEMENTS
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
        DefaultPermissions.VIEW_REPORTS
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
        DefaultPermissions.BACKUP_SYSTEM
    ]
} as const;

export type RoleType = keyof typeof DEFAULT_PERMISSIONS_CONFIG;

export const DEFAULT_ROLE = UserRole.STUDENT as RoleType;
