import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
    User,
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    ApiResponse
} from '../models/user.model';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private tokenKey = 'edugalaxy_access_token';
    private refreshTokenKey = 'edugalaxy_refresh_token';
    private currentUserKey = 'currentUser';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const token = this.getToken();
        if (token) {
            this.getCurrentUser().subscribe({
                next: (user) => {
                    if (user) {
                        this.currentUserSubject.next(user);
                    }
                },
                error: () => {
                    this.logout(false);
                }
            });
        }
    }

    login(credentials: LoginRequest): Observable<User> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
            map(response => response.data),
            tap(loginResponse => {
                localStorage.setItem(this.tokenKey, loginResponse.accessToken);
                localStorage.setItem(this.refreshTokenKey, loginResponse.refreshToken);
            }),
            switchMap(() =>
                this.getCurrentUser().pipe(
                    tap((user: User) => {
                        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
                        this.currentUserSubject.next(user);
                    })
                )
            ),
            catchError(this.handleError<User>('login'))
        );
    }


    register(userData: RegisterRequest): Observable<User> {
        return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, userData)
            .pipe(
                map(response => response.data),
                catchError(this.handleError<User>('register'))
            );
    }

    logout(navigate: boolean = true): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.currentUserSubject.next(null);

        if (navigate) {
            this.router.navigate(['/auth/login']);
        }
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`)
            .pipe(
                map(response => response.data),
                catchError(this.handleError<User>('getCurrentUser'))
            );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUserValue(): User | null {
        return this.currentUserSubject.value;
    }
    getCurrentUserFromLocalStorage(): User | null {
        const userJson = localStorage.getItem(this.currentUserKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUserValue();
        return user?.role?.name === role;
    }

    hasPermission(permission: string): boolean {
        const user = this.getCurrentUserValue();
        return user?.permissions?.some(p => p.name === permission) || false;
    }

    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(permission => this.hasPermission(permission));
    }

    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    isTeacher(): boolean {
        return this.hasRole('teacher');
    }

    isStudent(): boolean {
        return this.hasRole('student');
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed:`, error.message || 'Unknown error');
            return of(result as T);
        };
    }
}
