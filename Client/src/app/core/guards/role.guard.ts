import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.getCurrentUserFromLocalStorage();

    if (!user) {
        router.navigate(['/auth/login']);
        return false;
    }

    const roles = route.data?.['roles'] as string[] | undefined;
    if (!roles || roles.length === 0) {
        return true;
    }

    const userRole = user.role?.name;
    const hasRole = roles.some(r => r.toLowerCase() === userRole?.toLowerCase());

    if (hasRole) {
        return true;
    }

    router.navigate(['/forbidden']);
    return false;
};
