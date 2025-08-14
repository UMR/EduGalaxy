import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const permissionGuard: CanActivateFn = async (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Wait for user to be loaded
    const user = await auth.waitForUserLoad();

    if (!user) {
        router.navigate(['/auth/login']);
        return false;
    }

    const requiredPermissions = route.data?.['permissions'] as string[] | undefined;
    const requireAll = route.data?.['requireAllPermissions'] as boolean || false;

    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true; // No specific permissions required
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
