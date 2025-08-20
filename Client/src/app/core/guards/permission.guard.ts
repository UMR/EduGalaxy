import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getCurrentUserValue();

    if (!user) {
        router.navigate(['/auth/login']);
        return false;
    }

    const requiredPermissions = route.data?.['permissions'] as string[] | undefined;
    const requireAll = route.data?.['requireAllPermissions'] as boolean || false;

    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }

    const hasPermission = requireAll
        ? auth.hasAllPermissions(requiredPermissions)
        : auth.hasAnyPermission(requiredPermissions);

    if (hasPermission) {
        return true;
    }

    router.navigate(['/forbidden']);
    return false;
};
