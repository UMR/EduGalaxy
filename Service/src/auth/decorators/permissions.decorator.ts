import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (
    permissions: string[],
    requireAll = false,
) => SetMetadata(PERMISSIONS_KEY, { permissions, requireAll });

export const RequireAnyPermission = (...permissions: string[]) =>
    RequirePermissions(permissions, false);

export const RequireAllPermissions = (...permissions: string[]) =>
    RequirePermissions(permissions, true);
