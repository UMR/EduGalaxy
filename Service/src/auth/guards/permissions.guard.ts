import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAuthPayload } from '../../common/interfaces';
import { AuthorizationException } from '../../common/exceptions/auth.exceptions';
import { PERMISSIONS_KEY } from '../decorators';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<{
            permissions: string[];
            requireAll?: boolean;
        }>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: IAuthPayload = request.user;

        if (!user) {
            throw new AuthorizationException('User not authenticated');
        }

        const userPermissions = user.permissions || [];
        const { permissions: required, requireAll = false } = requiredPermissions;

        let hasPermission: boolean;

        if (requireAll) {
            hasPermission = required.every(permission =>
                userPermissions.includes(permission)
            );
        } else {
            hasPermission = required.some(permission =>
                userPermissions.includes(permission)
            );
        }

        if (!hasPermission) {
            const operation = requireAll ? 'all' : 'any';
            throw new AuthorizationException(
                `Access denied. Required ${operation} of permissions: ${required.join(', ')}`
            );
        }

        return true;
    }
}
