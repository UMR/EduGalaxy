import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { User, Role, Permission } from '../../../models/user.model';
import { DashboardStats, UserActivity } from '../../../models/dashboard.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    stats: DashboardStats | null = null;
    users: User[] = [];
    roles: Role[] = [];
    permissions: Permission[] = [];
    activities: UserActivity[] = [];

    isLoading = true;
    selectedUser: User | null = null;
    selectedRole: Role | null = null;
    showUserModal = false;
    showRoleModal = false;

    constructor(
        private authService: AuthService,
        private dashboardService: DashboardService
    ) { }

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.isLoading = true;

        forkJoin({
            stats: this.dashboardService.getAdminStats(),
            users: this.dashboardService.getAllUsers(),
            roles: this.dashboardService.getAllRoles(),
            permissions: this.dashboardService.getAllPermissions(),
            activities: this.dashboardService.getUserActivities()
        }).subscribe({
            next: (data) => {
                this.stats = data.stats || null;
                this.users = data.users || [];
                this.roles = data.roles || [];
                this.permissions = data.permissions || [];
                this.activities = data.activities || [];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.isLoading = false;
            }
        });
    }

    get currentUser() {
        return this.authService.getCurrentUserValue();
    }

    viewUser(user: User) {
        this.selectedUser = user;
        this.showUserModal = true;
    }

    closeUserModal() {
        this.showUserModal = false;
        this.selectedUser = null;
    }
    viewRole(role: Role) {
        this.selectedRole = role;
        this.showRoleModal = true;
    }

    closeRoleModal() {
        this.showRoleModal = false;
        this.selectedRole = null;
    }

    assignPermissionToRole(roleId: string, permissionId: string) {
        this.dashboardService.assignPermissionToRole(roleId, permissionId).subscribe({
            next: () => {
                this.dashboardService.getAllRoles().subscribe({
                    next: (roles) => {
                        this.roles = roles || [];
                    },
                    error: (error) => {
                        console.error('Error loading roles:', error);
                    }
                });
            },
            error: (error) => {
                console.error('Error assigning permission:', error);
            }
        });
    }

    removePermissionFromRole(roleId: string, permissionId: string) {
        this.dashboardService.removePermissionFromRole(roleId, permissionId).subscribe({
            next: () => {
                this.dashboardService.getAllRoles().subscribe({
                    next: (roles) => {
                        this.roles = roles || [];
                    },
                    error: (error) => {
                        console.error('Error loading roles:', error);
                    }
                });
            },
            error: (error) => {
                console.error('Error removing permission:', error);
            }
        });
    }

    getUserRoleName(user: User): string {
        return user.role?.name || 'No Role';
    }

    getUserPermissionCount(user: User): number {
        return user.permissions?.length || 0;
    }

    getRoleColor(roleName: string | undefined): string {
        switch (roleName?.toLowerCase()) {
            case 'admin': return 'danger';
            case 'teacher': return 'warning';
            case 'student': return 'primary';
            default: return 'secondary';
        }
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge-success' : 'badge-secondary';
    }

    formatDate(date: Date | string): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getUserCountForRole(roleId: string): number {
        return this.users.filter(u => u.role?.id === roleId).length;
    }
}
