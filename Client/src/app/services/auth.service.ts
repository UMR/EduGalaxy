import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { map, catchError, tap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
    User,
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    ApiResponse
} from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/auth';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    public isLoading$ = this.isLoadingSubject.asObservable();

    private tokenKey = 'edugalaxy_access_token';
    private refreshTokenKey = 'edugalaxy_refresh_token';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Check if user is already logged in
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const token = this.getToken();
        if (token) {
            this.isLoadingSubject.next(true);
            // Validate token with server
            this.getCurrentUser().subscribe({
                next: (user) => {
                    this.currentUserSubject.next(user);
                    this.isLoadingSubject.next(false);
                },
                error: () => {
                    this.isLoadingSubject.next(false);
                    this.logout(false);
                }
            });
        } else {
            this.isLoadingSubject.next(false);
        }
    }

    // Wait for user to be loaded
    async waitForUserLoad(): Promise<User | null> {
        // If already loaded or no token, return immediately
        const token = this.getToken();
        if (!token) {
            return null;
        }

        const currentUser = this.getCurrentUserValue();
        if (currentUser) {
            return currentUser;
        }

        // Wait for loading to complete
        await firstValueFrom(
            this.isLoading$.pipe(
                filter(loading => !loading),
                take(1)
            )
        );

        return this.getCurrentUserValue();
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        this.isLoadingSubject.next(true);
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials)
            .pipe(
                map(response => response.data),
                tap(loginResponse => {
                    // Store tokens
                    localStorage.setItem(this.tokenKey, loginResponse.accessToken);
                    localStorage.setItem(this.refreshTokenKey, loginResponse.refreshToken);

                    // Update current user
                    const user: User = {
                        ...loginResponse.user,
                        firstName: '',
                        lastName: '',
                        phone: '',
                        isActive: true,
                        emailVerified: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    this.currentUserSubject.next(user);
                    this.isLoadingSubject.next(false);
                }),
                catchError((error) => {
                    this.isLoadingSubject.next(false);
                    return this.handleError<LoginResponse>('login')(error);
                })
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

    refreshToken(): Observable<{ accessToken: string; refreshToken: string } | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return of(null);
        }

        return this.http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${this.apiUrl}/refresh`, { refreshToken })
            .pipe(
                map(response => response.data),
                tap(tokens => {
                    if (tokens) {
                        localStorage.setItem(this.tokenKey, tokens.accessToken);
                        localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
                    }
                }),
                catchError((error) => {
                    console.error('Token refresh failed:', error);
                    // Clear invalid tokens
                    localStorage.removeItem(this.tokenKey);
                    localStorage.removeItem(this.refreshTokenKey);
                    this.currentUserSubject.next(null);
                    return of(null);
                })
            );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired
        return !this.isTokenExpired(token);
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            return Date.now() > expiry;
        } catch (error) {
            // If we can't parse the token, consider it expired
            return true;
        }
    }

    // Check if token will expire soon (within 5 minutes)
    isTokenExpiringSoon(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
            return Date.now() > (expiry - fiveMinutes);
        } catch (error) {
            return true;
        }
    }

    getCurrentUserValue(): User | null {
        return this.currentUserSubject.value;
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
            // Log warning instead of error for expected failures
            if (error.status === 401) {
                console.warn(`${operation} failed: Unauthorized access`);
                this.logout(false); // Don't navigate automatically
            } else if (error.status === 403) {
                console.warn(`${operation} failed: Forbidden access`);
            } else if (error.status === 404) {
                console.warn(`${operation} failed: Resource not found`);
            } else if (error.status === 0) {
                console.warn(`${operation} failed: Network error or server unavailable`);
            } else {
                console.error(`${operation} failed:`, error.message || 'Unknown error');
            }

            // Return empty result to keep app running
            return of(result as T);
        };
    }

    // HTTP Headers with auth token
    getHttpOptions() {
        const token = this.getToken();
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            })
        };
    }
}
