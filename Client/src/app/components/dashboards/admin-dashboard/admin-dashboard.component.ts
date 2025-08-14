import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

    async loadDashboardData() {
        this.isLoading = true;

        try {
            const [stats, users, roles, permissions, activities] = await Promise.all([
                this.dashboardService.getAdminStats().toPromise(),
                this.dashboardService.getAllUsers().toPromise(),
                this.dashboardService.getAllRoles().toPromise(),
                this.dashboardService.getAllPermissions().toPromise(),
                this.dashboardService.getUserActivities().toPromise()
            ]);

            this.stats = stats || null;
            this.users = users || [];
            this.roles = roles || [];
            this.permissions = permissions || [];
            this.activities = activities || [];
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    get currentUser() {
        return this.authService.getCurrentUserValue();
    }

    // User Management
    viewUser(user: User) {
        this.selectedUser = user;
        this.showUserModal = true;
    }

    closeUserModal() {
        this.showUserModal = false;
        this.selectedUser = null;
    }

    // Role Management
    viewRole(role: Role) {
        this.selectedRole = role;
        this.showRoleModal = true;
    }

    closeRoleModal() {
        this.showRoleModal = false;
        this.selectedRole = null;
    }

    async assignPermissionToRole(roleId: string, permissionId: string) {
        try {
            await this.dashboardService.assignPermissionToRole(roleId, permissionId).toPromise();
            // Reload roles to update the UI
            this.roles = await this.dashboardService.getAllRoles().toPromise() || [];
        } catch (error) {
            console.error('Error assigning permission:', error);
        }
    }

    async removePermissionFromRole(roleId: string, permissionId: string) {
        try {
            await this.dashboardService.removePermissionFromRole(roleId, permissionId).toPromise();
            // Reload roles to update the UI
            this.roles = await this.dashboardService.getAllRoles().toPromise() || [];
        } catch (error) {
            console.error('Error removing permission:', error);
        }
    }

    // Utility methods
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

    // Helper method to get user count for a role
    getUserCountForRole(roleId: string): number {
        return this.users.filter(u => u.role?.id === roleId).length;
    }
}
