import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IAuthPayload } from '../../common/interfaces';
import { AuthorizationException } from '../../common/exceptions/auth.exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: IAuthPayload = request.user;

        if (!user) {
            throw new AuthorizationException('User not authenticated');
        }

        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new AuthorizationException(
                `Access denied. Required roles: ${requiredRoles.join(', ')}`
            );
        }

        return true;
    }
}
