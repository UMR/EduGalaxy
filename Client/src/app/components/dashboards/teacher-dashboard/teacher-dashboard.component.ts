import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardStats, Course, Assignment } from '../../../models/dashboard.model';

@Component({
    selector: 'app-teacher-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './teacher-dashboard.component.html',
    styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
    stats: DashboardStats | null = null;
    courses: Course[] = [];
    assignments: Assignment[] = [];

    isLoading = true;
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private dashboardService: DashboardService
    ) { }

    ngOnInit() {
        this.loadDashboardData();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadDashboardData() {
        console.log('Loading teacher dashboard data...');
        this.isLoading = true;

        // Add a timeout fallback in case data loading takes too long
        const timeoutId = setTimeout(() => {
            if (this.isLoading) {
                console.warn('Dashboard loading timeout, forcing completion');
                this.isLoading = false;
            }
        }, 5000);

        forkJoin({
            stats: this.dashboardService.getTeacherStats(),
            courses: this.dashboardService.getTeacherCourses(),
            assignments: this.dashboardService.getTeacherAssignments()
        }).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (data) => {
                clearTimeout(timeoutId);
                console.log('Dashboard data loaded successfully:', data);
                this.stats = data.stats || null;
                this.courses = data.courses || [];
                this.assignments = data.assignments || [];
                this.isLoading = false;
            },
            error: (error) => {
                clearTimeout(timeoutId);
                console.error('Error loading dashboard data:', error);
                this.isLoading = false;

                // Set fallback data
                this.stats = null;
                this.courses = [];
                this.assignments = [];
            }
        });
    }

    // Force reload data (for debugging)
    forceReload() {
        console.log('Force reloading dashboard data...');
        this.loadDashboardData();
    }

    get currentUser() {
        return this.authService.getCurrentUserValue();
    }

    getStatusColor(status: string): string {
        switch (status?.toLowerCase()) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'info';
            case 'inactive': return 'secondary';
            default: return 'secondary';
        }
    }

    formatDate(date: Date | string): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    logout() {
        this.authService.logout();
    }
}
