import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardStats, Course, Assignment } from '../../../models/dashboard.model';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [RouterModule, CommonModule],
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
    stats: DashboardStats | null = null;
    courses: Course[] = [];
    assignments: Assignment[] = [];

    isLoading = true;
    private loadCounter = 0;
    currentUser: any;

    constructor(
        private authService: AuthService,
        private dashboardService: DashboardService
    ) { }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        this.loadDashboardData();
    }

    loadDashboardData() {
        this.isLoading = true;
        this.loadCounter = 0;

        forkJoin([
            this.dashboardService.getStudentStats().pipe(
                catchError(err => {
                    console.error('Error loading stats:', err);
                    return of(null);
                })
            ),
            this.dashboardService.getStudentCourses().pipe(
                catchError(err => {
                    console.error('Error loading courses:', err);
                    return of([]);
                })
            ),
            this.dashboardService.getStudentAssignments().pipe(
                catchError(err => {
                    console.error('Error loading assignments:', err);
                    return of([]);
                })
            )
        ]).subscribe({
            next: ([stats, courses, assignments]) => {
                this.stats = stats;
                this.courses = courses || [];
                this.assignments = assignments || [];
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }
    getStatusColor(status: string): string {
        switch (status?.toLowerCase()) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'info';
            case 'submitted': return 'primary';
            case 'overdue': return 'danger';
            case 'inactive': return 'secondary';
            default: return 'secondary';
        }
    }

    getGradeColor(grade: number): string {
        if (grade >= 90) return 'success';
        if (grade >= 80) return 'info';
        if (grade >= 70) return 'warning';
        return 'danger';
    }

    getDaysUntilDue(dueDate: Date | string): number {
        const due = new Date(dueDate);
        const now = new Date();
        const timeDiff = due.getTime() - now.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
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
