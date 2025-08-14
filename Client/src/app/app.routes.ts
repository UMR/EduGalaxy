import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // Default redirect to dashboard
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },

    // Authentication routes (no layout)
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },

    // Protected routes with main layout
    {
        path: '',
        loadComponent: () => import('./components/shared/layout/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard],
        children: [
            // Dashboard routes
            {
                path: 'admin',
                canActivate: [roleGuard],
                data: { roles: ['admin', 'Admin'] },
                loadComponent: () => import('./components/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'teacher',
                canActivate: [roleGuard],
                data: { roles: ['teacher', 'Teacher'] },
                loadComponent: () => import('./components/dashboards/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
            },
            {
                path: 'student',
                canActivate: [roleGuard],
                data: { roles: ['student', 'Student'] },
                loadComponent: () => import('./components/dashboards/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
            },
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () => import('./components/shared/dashboard-redirect/dashboard-redirect.component').then(m => m.DashboardRedirectComponent)
            },

            // Additional protected routes
            {
                path: 'profile',
                loadComponent: () => import('./components/shared/profile/profile.component').then(c => c.ProfileComponent)
            },
            {
                path: 'menu-demo',
                loadComponent: () => import('./components/shared/menu-demo/menu-demo.component').then(c => c.MenuDemoComponent)
            }
        ]
    },

    // Standalone routes (no layout)
    {
        path: 'forbidden',
        loadComponent: () => import('./components/shared/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
    },
    {
        path: '**',
        loadComponent: () => import('./components/shared/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
