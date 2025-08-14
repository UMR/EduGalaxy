import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Only handle errors that weren't already handled by auth interceptor
            switch (error.status) {
                case 401:
                    // Only handle if it's not a refresh token request or login request
                    // The auth interceptor should handle most 401s
                    if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
                        console.warn('Authentication failed');
                        localStorage.removeItem('edugalaxy_access_token');
                        localStorage.removeItem('edugalaxy_refresh_token');
                        router.navigate(['/auth/login'], { queryParams: { expired: '1' } });
                    }
                    break;
                case 403:
                    // Forbidden - user doesn't have permission
                    console.warn('Access forbidden - insufficient permissions');
                    router.navigate(['/forbidden']);
                    break;
                case 0:
                    // Network error - only log if not in development
                    if (!req.url.includes('localhost')) {
                        console.warn('Network error - server might be unavailable');
                    }
                    break;
                case 404:
                    // Resource not found - only log non-API calls
                    if (!req.url.includes('/api/')) {
                        console.warn('Resource not found:', req.url);
                    }
                    break;
                case 500:
                    // Server error
                    console.error('Server error:', error.message || 'Internal server error');
                    break;
                default:
                    // Only log unexpected errors
                    if (error.status >= 400 && error.status < 500) {
                        console.warn(`Client error ${error.status}:`, error.message || 'Bad request');
                    } else if (error.status >= 500) {
                        console.error(`Server error ${error.status}:`, error.message || 'Server error');
                    }
                    break;
            }
            return throwError(() => error);
        })
    );
};
