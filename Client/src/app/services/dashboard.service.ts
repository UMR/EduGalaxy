import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { DashboardStats, Course, Assignment, UserActivity } from '../models/dashboard.model';
import { User, Role, Permission, ApiResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://localhost:3000';

    // Loading state
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Admin Dashboard
    getAdminStats(): Observable<DashboardStats> {
        return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/admin/stats`, this.authService.getHttpOptions())
            .pipe(
                map(response => response.data),
                catchError((error) => {
                    console.warn('Failed to fetch admin stats, using mock data:', error.message || 'Unknown error');
                    return of(this.getMockAdminStats());
                })
            );
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`, this.authService.getHttpOptions())
            .pipe(
                map(response => response.data),
                catchError((error) => {
                    console.warn('Failed to fetch users, using mock data:', error.message || 'Unknown error');
                    return of(this.getMockUsers());
                })
            );
    }

    getAllRoles(): Observable<Role[]> {
        return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/roles`, this.authService.getHttpOptions())
            .pipe(
                map(response => response.data),
                catchError((error) => {
                    console.warn('Failed to fetch roles, using mock data:', error.message || 'Unknown error');
                    return of(this.getMockRoles());
                })
            );
    }

    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<ApiResponse<Permission[]>>(`${this.apiUrl}/roles/permissions`, this.authService.getHttpOptions())
            .pipe(
                map(response => response.data),
                catchError((error) => {
                    console.warn('Failed to fetch permissions, using mock data:', error.message || 'Unknown error');
                    return of(this.getMockPermissions());
                })
            );
    }

    assignPermissionToRole(roleId: string, permissionId: string): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`, {}, this.authService.getHttpOptions())
            .pipe(
                map(response => response.data),
                catchError((error) => {
                    console.error('Failed to assign permission to role:', error.message || 'Unknown error');
                    return of(null);
                })
            );
    }

    removePermissionFromRole(roleId: string, permissionId: string): Observable<any> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`, this.authService.getHttpOptions())
            .pipe(
                map(response => response.data),
                catchError((error) => {
                    console.error('Failed to remove permission from role:', error.message || 'Unknown error');
                    return of(null);
                })
            );
    }

    getUserActivities(): Observable<UserActivity[]> {
        return of(this.getMockUserActivities());
    }

    // Student Dashboard
    getStudentStats(): Observable<DashboardStats> {
        return of(this.getMockStudentStats());
    }

    getStudentCourses(): Observable<Course[]> {
        return of(this.getMockStudentCourses());
    }

    getStudentAssignments(): Observable<Assignment[]> {
        return of(this.getMockStudentAssignments());
    }

    // Teacher Dashboard
    getTeacherStats(): Observable<DashboardStats> {
        return of(this.getMockTeacherStats());
    }

    getTeacherCourses(): Observable<Course[]> {
        return of(this.getMockTeacherCourses());
    }

    getTeacherAssignments(): Observable<Assignment[]> {
        return of(this.getMockTeacherAssignments());
    }

    // Mock Data Functions
    private getMockAdminStats(): DashboardStats {
        return {
            totalUsers: 1234,
            totalCourses: 89,
            totalStudents: 1045,
            totalTeachers: 45,
            activeUsers: 892,
            recentRegistrations: 23
        };
    }

    private getMockStudentStats(): DashboardStats {
        return {
            enrolledCourses: 6,
            completedCourses: 3,
            averageGrade: 87.5,
            upcomingAssignments: 4
        };
    }

    private getMockTeacherStats(): DashboardStats {
        return {
            totalCourses: 8,
            totalStudents: 245,
            averageGrade: 82.3,
            upcomingAssignments: 12
        };
    }

    private getMockUsers(): User[] {
        return [
            {
                id: '1',
                email: 'admin@edugalaxy.com',
                username: 'admin',
                firstName: 'System',
                lastName: 'Administrator',
                role: { id: '1', name: 'admin', description: 'System Administrator', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                permissions: [],
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                email: 'teacher@edugalaxy.com',
                username: 'teacher',
                firstName: 'John',
                lastName: 'Teacher',
                role: { id: '2', name: 'teacher', description: 'Teacher', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                permissions: [],
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }

    private getMockRoles(): Role[] {
        return [
            { id: '1', name: 'admin', description: 'System Administrator', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: '2', name: 'teacher', description: 'Teacher', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: '3', name: 'student', description: 'Student', isActive: true, createdAt: new Date(), updatedAt: new Date() }
        ];
    }

    private getMockPermissions(): Permission[] {
        return [
            { id: '1', name: 'user:create', description: 'Create users', resource: 'user', action: 'create', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: '2', name: 'user:read', description: 'View users', resource: 'user', action: 'read', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: '3', name: 'user:update', description: 'Update users', resource: 'user', action: 'update', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: '4', name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete', isActive: true, createdAt: new Date(), updatedAt: new Date() }
        ];
    }

    private getMockUserActivities(): UserActivity[] {
        return [
            { id: '1', user: 'John Doe', action: 'Logged in', timestamp: new Date(), details: 'Successful login' },
            { id: '2', user: 'Jane Smith', action: 'Enrolled in course', timestamp: new Date(), details: 'Angular Development' },
            { id: '3', user: 'Mike Johnson', action: 'Submitted assignment', timestamp: new Date(), details: 'Project submission' }
        ];
    }

    private getMockStudentCourses(): Course[] {
        return [
            {
                id: '1',
                title: 'Angular Development',
                description: 'Learn modern Angular development',
                instructor: 'John Teacher',
                duration: '12 weeks',
                enrolled: 45,
                rating: 4.8,
                status: 'active'
            },
            {
                id: '2',
                title: 'React Fundamentals',
                description: 'Master React from basics to advanced',
                instructor: 'Jane Teacher',
                duration: '8 weeks',
                enrolled: 32,
                rating: 4.6,
                status: 'active'
            }
        ];
    }

    private getMockStudentAssignments(): Assignment[] {
        return [
            {
                id: '1',
                title: 'Angular Component Design',
                course: 'Angular Development',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'pending'
            },
            {
                id: '2',
                title: 'React Hooks Project',
                course: 'React Fundamentals',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: 'submitted',
                grade: 92
            }
        ];
    }

    private getMockTeacherCourses(): Course[] {
        return [
            {
                id: '1',
                title: 'Angular Development',
                description: 'Learn modern Angular development',
                instructor: 'You',
                duration: '12 weeks',
                enrolled: 45,
                rating: 4.8,
                status: 'active'
            },
            {
                id: '2',
                title: 'TypeScript Mastery',
                description: 'Advanced TypeScript concepts',
                instructor: 'You',
                duration: '6 weeks',
                enrolled: 28,
                rating: 4.9,
                status: 'active'
            }
        ];
    }

    private getMockTeacherAssignments(): Assignment[] {
        return [
            {
                id: '1',
                title: 'Angular Component Design',
                course: 'Angular Development',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'pending'
            },
            {
                id: '2',
                title: 'TypeScript Advanced Types',
                course: 'TypeScript Mastery',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: 'pending'
            }
        ];
    }
    setLoading(isLoading: boolean) {
        this.loadingSubject.next(isLoading);
    }

    formatDate(date: string | Date): string {
        if (!date) return 'N/A';

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(date: string | Date): string {
        if (!date) return 'N/A';

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusColor(status: string): string {
        if (!status) return 'secondary';

        status = status.toLowerCase();

        if (status === 'active' || status === 'completed' || status === 'approved') {
            return 'success';
        } else if (status === 'pending' || status === 'in progress') {
            return 'warning';
        } else if (status === 'inactive' || status === 'failed' || status === 'rejected') {
            return 'danger';
        } else if (status === 'draft') {
            return 'secondary';
        } else {
            return 'primary';
        }
    }

    getGradeColor(grade: number): string {
        if (grade >= 90) {
            return 'success';
        } else if (grade >= 75) {
            return 'primary';
        } else if (grade >= 60) {
            return 'warning';
        } else {
            return 'danger';
        }
    }

    getDaysUntilDue(dueDate: string | Date): number {
        if (!dueDate) return 0;

        const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
        const today = new Date();

        // Reset time portion for accurate day calculation
        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Calculate difference in days
        const differenceMs = due.getTime() - today.getTime();
        return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
    }
}
