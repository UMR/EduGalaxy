import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { MenuItem, MenuGroup, MenuConfig } from '../models/menu.model';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private menuConfigSubject = new BehaviorSubject<MenuConfig>({ groups: [] });
    public menuConfig$ = this.menuConfigSubject.asObservable();

    constructor(private authService: AuthService) {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.initializeMenu();
            }
        });
    }

    private initializeMenu(): void {
        const menuConfig: MenuConfig = {
            groups: [
                // Dashboard Group
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    order: 1,
                    items: [
                        {
                            id: 'admin-dashboard',
                            label: 'Admin Dashboard',
                            icon: 'fas fa-user-shield',
                            route: '/admin',
                            roles: ['Admin'],
                            permissions: ['admin:dashboard', 'admin:manage-users']
                        },
                        {
                            id: 'teacher-dashboard',
                            label: 'Teacher Dashboard',
                            icon: 'fas fa-chalkboard-teacher',
                            route: '/teacher',
                            roles: ['Teacher'],
                            permissions: ['teacher:dashboard', 'teacher:manage-courses']
                        },
                        {
                            id: 'student-dashboard',
                            label: 'Student Dashboard',
                            icon: 'fas fa-user-graduate',
                            route: '/student',
                            roles: ['Student'],
                            permissions: ['student:view-courses', 'student:enroll']
                        }
                    ]
                },

                // User Management Group
                {
                    id: 'user-management',
                    label: 'User Management',
                    icon: 'fas fa-users',
                    order: 2,
                    roles: ['Admin'],
                    permissions: ['user:read', 'admin:manage-users'],
                    items: [
                        {
                            id: 'users-list',
                            label: 'All Users',
                            icon: 'fas fa-list',
                            route: '/admin/users',
                            permissions: ['user:read', 'admin:manage-users']
                        },
                        {
                            id: 'users-create',
                            label: 'Add User',
                            icon: 'fas fa-user-plus',
                            route: '/admin/users/create',
                            permissions: ['user:create', 'admin:manage-users']
                        },
                        {
                            id: 'users-import',
                            label: 'Import Users',
                            icon: 'fas fa-file-import',
                            route: '/admin/users/import',
                            permissions: ['user:import', 'admin:manage-users']
                        },
                        {
                            id: 'users-export',
                            label: 'Export Users',
                            icon: 'fas fa-file-export',
                            route: '/admin/users/export',
                            permissions: ['user:export', 'admin:manage-users']
                        }
                    ]
                },

                // Role & Permission Management
                {
                    id: 'role-management',
                    label: 'Role & Permissions',
                    icon: 'fas fa-user-tag',
                    order: 3,
                    roles: ['Admin'],
                    permissions: ['role:read', 'permission:read'],
                    items: [
                        {
                            id: 'roles-list',
                            label: 'Manage Roles',
                            icon: 'fas fa-users-cog',
                            route: '/admin/roles',
                            permissions: ['role:read']
                        },
                        {
                            id: 'roles-create',
                            label: 'Create Role',
                            icon: 'fas fa-plus',
                            route: '/admin/roles/create',
                            permissions: ['role:create']
                        },
                        {
                            id: 'permissions-list',
                            label: 'Manage Permissions',
                            icon: 'fas fa-key',
                            route: '/admin/permissions',
                            permissions: ['permission:read']
                        },
                        {
                            id: 'permissions-create',
                            label: 'Create Permission',
                            icon: 'fas fa-plus-circle',
                            route: '/admin/permissions/create',
                            permissions: ['permission:create']
                        },
                        {
                            id: 'role-assignments',
                            label: 'Role Assignments',
                            icon: 'fas fa-user-check',
                            route: '/admin/role-assignments',
                            permissions: ['role:assign']
                        }
                    ]
                },

                // Course Management
                {
                    id: 'course-management',
                    label: 'Course Management',
                    icon: 'fas fa-book',
                    order: 4,
                    roles: ['Admin', 'Teacher'],
                    items: [
                        {
                            id: 'courses-list',
                            label: 'All Courses',
                            icon: 'fas fa-list',
                            route: '/courses',
                            permissions: ['course:read']
                        },
                        {
                            id: 'courses-create',
                            label: 'Create Course',
                            icon: 'fas fa-plus',
                            route: '/courses/create',
                            permissions: ['course:create']
                        },
                        {
                            id: 'my-courses',
                            label: 'My Courses',
                            icon: 'fas fa-book-open',
                            route: '/courses/my-courses',
                            roles: ['Teacher'],
                            permissions: ['course:manage-own']
                        },
                        {
                            id: 'course-categories',
                            label: 'Categories',
                            icon: 'fas fa-tags',
                            route: '/courses/categories',
                            permissions: ['course:category:read']
                        },
                        {
                            id: 'course-approval',
                            label: 'Course Approval',
                            icon: 'fas fa-check-circle',
                            route: '/courses/approval',
                            roles: ['Admin'],
                            permissions: ['course:approve']
                        }
                    ]
                },

                // Content Management
                {
                    id: 'content-management',
                    label: 'Content Management',
                    icon: 'fas fa-edit',
                    order: 5,
                    roles: ['Admin', 'Teacher'],
                    permissions: ['content:read'],
                    items: [
                        {
                            id: 'lessons-list',
                            label: 'All Lessons',
                            icon: 'fas fa-play-circle',
                            route: '/content/lessons',
                            permissions: ['lesson:read']
                        },
                        {
                            id: 'lessons-create',
                            label: 'Create Lesson',
                            icon: 'fas fa-plus',
                            route: '/content/lessons/create',
                            permissions: ['lesson:create']
                        },
                        {
                            id: 'assignments-management',
                            label: 'Assignments',
                            icon: 'fas fa-tasks',
                            route: '/content/assignments',
                            permissions: ['assignment:read']
                        },
                        {
                            id: 'quizzes-management',
                            label: 'Quizzes',
                            icon: 'fas fa-question-circle',
                            route: '/content/quizzes',
                            permissions: ['quiz:read']
                        },
                        {
                            id: 'media-library',
                            label: 'Media Library',
                            icon: 'fas fa-photo-video',
                            route: '/content/media',
                            permissions: ['media:read']
                        }
                    ]
                },

                // Student Learning
                {
                    id: 'learning',
                    label: 'Learning',
                    icon: 'fas fa-graduation-cap',
                    order: 6,
                    roles: ['Student'],
                    items: [
                        {
                            id: 'enrolled-courses',
                            label: 'My Courses',
                            icon: 'fas fa-book-open',
                            route: '/learning/my-courses',
                            permissions: ['student:view-courses']
                        },
                        {
                            id: 'course-catalog',
                            label: 'Browse Courses',
                            icon: 'fas fa-search',
                            route: '/learning/catalog',
                            permissions: ['course:browse']
                        },
                        {
                            id: 'assignments',
                            label: 'Assignments',
                            icon: 'fas fa-tasks',
                            route: '/learning/assignments',
                            permissions: ['assignment:view']
                        },
                        {
                            id: 'grades',
                            label: 'My Grades',
                            icon: 'fas fa-chart-line',
                            route: '/learning/grades',
                            permissions: ['grade:view-own']
                        },
                        {
                            id: 'certificates',
                            label: 'Certificates',
                            icon: 'fas fa-certificate',
                            route: '/learning/certificates',
                            permissions: ['certificate:view-own']
                        }
                    ]
                },

                // Assessment & Grading
                {
                    id: 'assessment',
                    label: 'Assessment & Grading',
                    icon: 'fas fa-clipboard-check',
                    order: 7,
                    roles: ['Admin', 'Teacher'],
                    permissions: ['assessment:read'],
                    items: [
                        {
                            id: 'grade-management',
                            label: 'Grade Management',
                            icon: 'fas fa-calculator',
                            route: '/assessment/grades',
                            permissions: ['grade:manage']
                        },
                        {
                            id: 'submission-review',
                            label: 'Review Submissions',
                            icon: 'fas fa-file-alt',
                            route: '/assessment/submissions',
                            permissions: ['submission:review']
                        },
                        {
                            id: 'rubrics',
                            label: 'Rubrics',
                            icon: 'fas fa-th-list',
                            route: '/assessment/rubrics',
                            permissions: ['rubric:read']
                        },
                        {
                            id: 'grade-book',
                            label: 'Grade Book',
                            icon: 'fas fa-book',
                            route: '/assessment/gradebook',
                            permissions: ['gradebook:view']
                        }
                    ]
                },

                // Communication
                {
                    id: 'communication',
                    label: 'Communication',
                    icon: 'fas fa-comments',
                    order: 8,
                    items: [
                        {
                            id: 'messages',
                            label: 'Messages',
                            icon: 'fas fa-envelope',
                            route: '/communication/messages',
                            permissions: ['message:read']
                        },
                        {
                            id: 'announcements',
                            label: 'Announcements',
                            icon: 'fas fa-bullhorn',
                            route: '/communication/announcements',
                            permissions: ['announcement:read']
                        },
                        {
                            id: 'discussion-forums',
                            label: 'Discussion Forums',
                            icon: 'fas fa-comments',
                            route: '/communication/forums',
                            permissions: ['forum:read']
                        },
                        {
                            id: 'notifications',
                            label: 'Notifications',
                            icon: 'fas fa-bell',
                            route: '/communication/notifications',
                            permissions: ['notification:read']
                        }
                    ]
                },

                // Reports & Analytics
                {
                    id: 'reports',
                    label: 'Reports & Analytics',
                    icon: 'fas fa-chart-bar',
                    order: 9,
                    roles: ['Admin', 'Teacher'],
                    permissions: ['report:read'],
                    items: [
                        {
                            id: 'student-progress',
                            label: 'Student Progress',
                            icon: 'fas fa-chart-line',
                            route: '/reports/student-progress',
                            permissions: ['report:student:read']
                        },
                        {
                            id: 'course-analytics',
                            label: 'Course Analytics',
                            icon: 'fas fa-chart-pie',
                            route: '/reports/course-analytics',
                            permissions: ['report:course:read']
                        },
                        {
                            id: 'enrollment-reports',
                            label: 'Enrollment Reports',
                            icon: 'fas fa-users',
                            route: '/reports/enrollment',
                            permissions: ['report:enrollment:read']
                        },
                        {
                            id: 'system-reports',
                            label: 'System Reports',
                            icon: 'fas fa-file-alt',
                            route: '/reports/system',
                            roles: ['Admin'],
                            permissions: ['report:system:read']
                        },
                        {
                            id: 'performance-analytics',
                            label: 'Performance Analytics',
                            icon: 'fas fa-tachometer-alt',
                            route: '/reports/performance',
                            roles: ['Admin'],
                            permissions: ['report:performance:read']
                        }
                    ]
                },

                // Finance & Billing (for Admin)
                {
                    id: 'finance',
                    label: 'Finance & Billing',
                    icon: 'fas fa-dollar-sign',
                    order: 10,
                    roles: ['Admin'],
                    permissions: ['finance:read'],
                    items: [
                        {
                            id: 'payments',
                            label: 'Payments',
                            icon: 'fas fa-credit-card',
                            route: '/finance/payments',
                            permissions: ['payment:read']
                        },
                        {
                            id: 'invoices',
                            label: 'Invoices',
                            icon: 'fas fa-file-invoice',
                            route: '/finance/invoices',
                            permissions: ['invoice:read']
                        },
                        {
                            id: 'subscription-management',
                            label: 'Subscriptions',
                            icon: 'fas fa-sync-alt',
                            route: '/finance/subscriptions',
                            permissions: ['subscription:read']
                        },
                        {
                            id: 'financial-reports',
                            label: 'Financial Reports',
                            icon: 'fas fa-chart-bar',
                            route: '/finance/reports',
                            permissions: ['finance:report:read']
                        }
                    ]
                },

                // System Administration
                {
                    id: 'system-admin',
                    label: 'System Administration',
                    icon: 'fas fa-cogs',
                    order: 11,
                    roles: ['Admin'],
                    permissions: ['system:admin'],
                    items: [
                        {
                            id: 'system-settings',
                            label: 'System Settings',
                            icon: 'fas fa-cog',
                            route: '/admin/system-settings',
                            permissions: ['system:settings:read']
                        },
                        {
                            id: 'backup-restore',
                            label: 'Backup & Restore',
                            icon: 'fas fa-database',
                            route: '/admin/backup',
                            permissions: ['system:backup']
                        },
                        {
                            id: 'audit-logs',
                            label: 'Audit Logs',
                            icon: 'fas fa-history',
                            route: '/admin/audit-logs',
                            permissions: ['system:audit:read']
                        },
                        {
                            id: 'system-health',
                            label: 'System Health',
                            icon: 'fas fa-heartbeat',
                            route: '/admin/system-health',
                            permissions: ['system:health:read']
                        },
                        {
                            id: 'email-templates',
                            label: 'Email Templates',
                            icon: 'fas fa-envelope-open-text',
                            route: '/admin/email-templates',
                            permissions: ['system:email:manage']
                        }
                    ]
                },

                // Calendar & Events
                {
                    id: 'calendar',
                    label: 'Calendar & Events',
                    icon: 'fas fa-calendar-alt',
                    order: 12,
                    items: [
                        {
                            id: 'my-calendar',
                            label: 'My Calendar',
                            icon: 'fas fa-calendar',
                            route: '/calendar/my-calendar',
                            permissions: ['calendar:read']
                        },
                        {
                            id: 'class-schedule',
                            label: 'Class Schedule',
                            icon: 'fas fa-clock',
                            route: '/calendar/schedule',
                            permissions: ['schedule:read']
                        },
                        {
                            id: 'events',
                            label: 'Events',
                            icon: 'fas fa-calendar-plus',
                            route: '/calendar/events',
                            permissions: ['event:read']
                        },
                        {
                            id: 'create-event',
                            label: 'Create Event',
                            icon: 'fas fa-plus',
                            route: '/calendar/events/create',
                            roles: ['Admin', 'Teacher'],
                            permissions: ['event:create']
                        }
                    ]
                },

                // Library & Resources
                {
                    id: 'library',
                    label: 'Library & Resources',
                    icon: 'fas fa-book-reader',
                    order: 13,
                    items: [
                        {
                            id: 'digital-library',
                            label: 'Digital Library',
                            icon: 'fas fa-books',
                            route: '/library/digital',
                            permissions: ['library:read']
                        },
                        {
                            id: 'resource-sharing',
                            label: 'Resource Sharing',
                            icon: 'fas fa-share-alt',
                            route: '/library/sharing',
                            permissions: ['resource:share']
                        },
                        {
                            id: 'study-materials',
                            label: 'Study Materials',
                            icon: 'fas fa-file-pdf',
                            route: '/library/study-materials',
                            permissions: ['study:material:read']
                        },
                        {
                            id: 'reference-materials',
                            label: 'Reference Materials',
                            icon: 'fas fa-bookmark',
                            route: '/library/reference',
                            permissions: ['reference:read']
                        }
                    ]
                },

                // Settings & Profile
                {
                    id: 'settings',
                    label: 'Settings & Profile',
                    icon: 'fas fa-user-cog',
                    order: 14,
                    items: [
                        {
                            id: 'profile',
                            label: 'My Profile',
                            icon: 'fas fa-user',
                            route: '/profile'
                        },
                        {
                            id: 'account-settings',
                            label: 'Account Settings',
                            icon: 'fas fa-cog',
                            route: '/settings/account'
                        },
                        {
                            id: 'privacy-settings',
                            label: 'Privacy Settings',
                            icon: 'fas fa-shield-alt',
                            route: '/settings/privacy'
                        },
                        {
                            id: 'notification-preferences',
                            label: 'Notifications',
                            icon: 'fas fa-bell',
                            route: '/settings/notifications'
                        },
                        {
                            id: 'theme-settings',
                            label: 'Theme Settings',
                            icon: 'fas fa-palette',
                            route: '/settings/theme'
                        },
                        {
                            divider: true,
                            id: 'divider-1',
                            label: ''
                        },
                        {
                            id: 'help-support',
                            label: 'Help & Support',
                            icon: 'fas fa-question-circle',
                            route: '/help'
                        },
                        {
                            id: 'feedback',
                            label: 'Send Feedback',
                            icon: 'fas fa-comment-dots',
                            route: '/feedback'
                        },
                        {
                            divider: true,
                            id: 'divider-2',
                            label: ''
                        },
                        {
                            id: 'logout',
                            label: 'Logout',
                            icon: 'fas fa-sign-out-alt',
                            route: '/logout'
                        }
                    ]
                }
            ]
        };

        this.updateMenuConfig(menuConfig);
    }

    private updateMenuConfig(config: MenuConfig): void {
        const filteredConfig = this.filterMenuByPermissions(config);
        this.menuConfigSubject.next(filteredConfig);
    }

    private filterMenuByPermissions(config: MenuConfig): MenuConfig {
        const user = this.authService.getCurrentUserValue();
        if (!user) {
            return { groups: [] };
        }

        const filteredGroups = config.groups
            .filter(group => this.hasAccess(group.roles, group.permissions))
            .map(group => ({
                ...group,
                items: group.items
                    .filter(item => this.hasAccess(item.roles, item.permissions))
                    .map(item => ({
                        ...item,
                        isVisible: true,
                        children: item.children
                            ? item.children.filter(child => this.hasAccess(child.roles, child.permissions))
                            : undefined
                    }))
            }))
            .filter(group => group.items.length > 0);

        return { groups: filteredGroups };
    }

    private hasAccess(requiredRoles?: string[], requiredPermissions?: string[]): boolean {
        const user = this.authService.getCurrentUserValue();
        if (!user) return false;

        // If no specific requirements, allow access
        if (!requiredRoles && !requiredPermissions) {
            return true;
        }

        // Check role access
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.some(role =>
                user.role?.name?.toLowerCase() === role.toLowerCase()
            );
            if (!hasRole) return false;
        }

        // Check permission access
        if (requiredPermissions && requiredPermissions.length > 0) {
            const hasPermission = requiredPermissions.some(permission =>
                this.authService.hasPermission(permission)
            );
            if (!hasPermission) return false;
        }

        return true;
    }

    // Get filtered menu for current user
    getMenuForUser(): Observable<MenuConfig> {
        return this.menuConfig$;
    }

    // Refresh menu when user permissions change
    refreshMenu(): void {
        this.initializeMenu();
    }

    // Get specific menu group
    getMenuGroup(groupId: string): MenuGroup | undefined {
        const config = this.menuConfigSubject.value;
        return config.groups.find(group => group.id === groupId);
    }

    // Get specific menu item
    getMenuItem(groupId: string, itemId: string): MenuItem | undefined {
        const group = this.getMenuGroup(groupId);
        if (!group) return undefined;

        return group.items.find(item => item.id === itemId);
    }

    // Check if user has access to specific menu item
    hasMenuAccess(groupId: string, itemId: string): boolean {
        const item = this.getMenuItem(groupId, itemId);
        if (!item) return false;

        return this.hasAccess(item.roles, item.permissions);
    }

    // Add custom menu item
    addMenuItem(groupId: string, item: MenuItem): void {
        const config = this.menuConfigSubject.value;
        const group = config.groups.find(g => g.id === groupId);
        if (group) {
            group.items.push(item);
            this.updateMenuConfig(config);
        }
    }

    // Remove menu item
    removeMenuItem(groupId: string, itemId: string): void {
        const config = this.menuConfigSubject.value;
        const group = config.groups.find(g => g.id === groupId);
        if (group) {
            group.items = group.items.filter(item => item.id !== itemId);
            this.updateMenuConfig(config);
        }
    }
}
