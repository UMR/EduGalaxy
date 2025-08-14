import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = async (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Wait for user to be loaded
    const user = await auth.waitForUserLoad();

    if (!user) {
        router.navigate(['/auth/login']);
        return false;
    }

    const roles = route.data?.['roles'] as string[] | undefined;
    if (!roles || roles.length === 0) {
        return true; // no specific role required
    }

    const userRole = user.role?.name;
    const hasRole = roles.some(r => r.toLowerCase() === userRole?.toLowerCase());

    if (hasRole) {
        return true;
    }

    router.navigate(['/forbidden']);
    return false;
};
