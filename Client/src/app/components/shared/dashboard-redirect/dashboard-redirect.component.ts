import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-dashboard-redirect',
    template: `
        <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Redirecting to your dashboard...</p>
            </div>
        </div>
    `,
    standalone: true
})
export class DashboardRedirectComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    async ngOnInit() {
        try {
            const user = await this.authService.getCurrentUserFromLocalStorage();

            if (!user) {
                this.router.navigate(['/auth/login']);
                return;
            }

            const role = user.role?.name?.toLowerCase();
            switch (role) {
                case 'admin':
                    this.router.navigate(['/admin']);
                    break;
                case 'teacher':
                    this.router.navigate(['/teacher']);
                    break;
                case 'student':
                    this.router.navigate(['/student']);
                    break;
                default:
                    this.router.navigate(['/student']);
                    break;
            }
        } catch (error) {
            console.error('Error redirecting to dashboard:', error);
            this.router.navigate(['/auth/login']);
        }
    }
}
