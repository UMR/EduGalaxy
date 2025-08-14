import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, finalize, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

// Token storage keys
const TOKEN_KEY = 'edugalaxy_access_token';
const REFRESH_TOKEN_KEY = 'edugalaxy_refresh_token';

// Helper functions to avoid circular dependency
function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Auth token & refresh handling interceptor (Angular 20 functional style)
export const authTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const router = inject(Router);
    const http = inject(HttpClient);
    const accessToken = getToken();

    // Add auth header if token exists and not already present
    let authReq = req;
    if (accessToken && !req.headers.has('Authorization')) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${accessToken}` }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Handle 401 errors (token expired/invalid)
            if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
                return handle401Error(req, next, router, http);
            }
            return throwError(() => error);
        })
    );
};

function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, router: Router, http: HttpClient): Observable<HttpEvent<unknown>> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshToken = getRefreshToken();
        if (refreshToken) {
            return http.post<any>('http://localhost:3000/auth/refresh', { refreshToken }).pipe(
                switchMap((response: any) => {
                    // Handle nested response structure
                    const tokens = response?.data || response;
                    if (tokens?.accessToken) {
                        setTokens(tokens.accessToken, tokens.refreshToken || refreshToken);
                        refreshTokenSubject.next(tokens.accessToken);
                        // Retry the original request with new token
                        const authReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${tokens.accessToken}` }
                        });
                        return next(authReq);
                    } else {
                        // Refresh failed, logout user quietly
                        console.warn('Token refresh failed: Invalid response structure', response);
                        clearTokens();
                        router.navigate(['/auth/login']);
                        return throwError(() => new Error('Token refresh failed'));
                    }
                }),
                catchError((err) => {
                    // Refresh failed, logout user quietly
                    if (err.status !== 401) {
                        console.warn('Token refresh failed:', err.message || 'Network error', err);
                    }
                    console.log('Full error response:', err);
                    clearTokens();
                    router.navigate(['/auth/login']);
                    return throwError(() => err);
                }),
                finalize(() => {
                    isRefreshing = false;
                })
            );
        } else {
            // No refresh token, logout user quietly
            isRefreshing = false;
            clearTokens();
            router.navigate(['/auth/login']);
            return throwError(() => new Error('No refresh token available'));
        }
    } else {
        // Wait for the refresh to complete, then retry with new token
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
                const authReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${token}` }
                });
                return next(authReq);
            })
        );
    }
}
