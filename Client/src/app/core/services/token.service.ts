import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly ACCESS_TOKEN_KEY = 'edugalaxy_access_token';
    private readonly REFRESH_TOKEN_KEY = 'edugalaxy_refresh_token';

    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    clearTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    isTokenValid(token: string): boolean {
        if (!token) return false;

        try {
            const payload = this.decodeToken(token);
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
        if (!token) return true;

        try {
            const payload = this.decodeToken(token);
            const threshold = minutesThreshold * 60 * 1000; // Convert to milliseconds
            return (payload.exp * 1000 - Date.now()) < threshold;
        } catch {
            return true;
        }
    }

    private decodeToken(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const payload = parts[1];
        return JSON.parse(atob(payload));
    }

    getTokenPayload(token: string): any {
        try {
            return this.decodeToken(token);
        } catch {
            return null;
        }
    }
}
