import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.initializeForm();

        // Redirect if already logged in
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

    private initializeForm() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            const { email, password, rememberMe } = this.loginForm.value;

            this.authService.login({ email, password }).subscribe({
                next: (response) => {
                    console.log('Login successful:', response);

                    // Navigate based on user role
                    const user = this.authService.getCurrentUserValue();
                    if (user?.role?.name?.toLowerCase() === 'admin') {
                        this.router.navigate(['/admin']);
                    } else if (user?.role?.name?.toLowerCase() === 'teacher') {
                        this.router.navigate(['/teacher']);
                    } else if (user?.role?.name?.toLowerCase() === 'student') {
                        this.router.navigate(['/student']);
                    } else {
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (error) => {
                    console.error('Login error:', error);
                    this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched() {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }

    // Demo login methods
    loginAsAdmin() {
        this.loginForm.patchValue({
            email: 'admin@edugalaxy.com',
            password: 'admin123'
        });
        this.onSubmit();
    }

    loginAsTeacher() {
        this.loginForm.patchValue({
            email: 'teacher@edugalaxy.com',
            password: 'teacher123'
        });
        this.onSubmit();
    }

    loginAsStudent() {
        this.loginForm.patchValue({
            email: 'student@edugalaxy.com',
            password: 'student123'
        });
        this.onSubmit();
    }
}
