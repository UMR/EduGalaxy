import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entities/generated/Users';
import { UserPermissions } from '../../entities/generated/UserPermissions';
import { UserRoles } from '../../entities/generated/UserRoles';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        @InjectRepository(UserPermissions)
        private userPermissionRepository: Repository<UserPermissions>,
        @InjectRepository(UserRoles)
        private userRolesRepository: Repository<UserRoles>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            return false;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request['user'] = payload;

            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            const requiredPermissions = this.reflector.getAllAndOverride<{ permissions: string[], requireAll: boolean }>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!requiredRoles?.length && !requiredPermissions?.permissions?.length) {
                return true;
            }

            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            });

            if (!user) {
                return false;
            }

            let hasRole = true;
            if (requiredRoles?.length) {
                const userRole = await this.userRolesRepository.findOne({
                    where: { userId: user.id },
                    relations: ['role'],
                });

                hasRole = userRole ? requiredRoles.includes(userRole.role.name) : false;
            }

            // Check permissions if required
            let hasPermission = true;
            if (requiredPermissions?.permissions?.length) {
                const userPermissions = await this.userPermissionRepository.find({
                    where: { userId: user.id },
                    relations: ['permission'],
                });

                const userPermissionNames = userPermissions.map(up => up.permission.permissionKey);

                if (requiredPermissions.requireAll) {
                    hasPermission = requiredPermissions.permissions.every(permission =>
                        userPermissionNames.includes(permission)
                    );
                } else {
                    hasPermission = requiredPermissions.permissions.some(permission =>
                        userPermissionNames.includes(permission)
                    );
                }
            }
            return hasRole && hasPermission;

        } catch (error) {
            return false;
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
