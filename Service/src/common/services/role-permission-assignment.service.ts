import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../entities/generated/Roles';
import { Permissions } from '../../entities/generated/Permissions';
import { UserRoles } from '../../entities/generated/UserRoles';
import { UserPermissionService } from '../../services/user-permission.service';
import { DEFAULT_PERMISSIONS_CONFIG, DEFAULT_ROLE, RoleType } from '../config/default-permissions.config';

@Injectable()
export class RolePermissionAssignmentService {
    constructor(
        @InjectRepository(Roles)
        private readonly roleRepo: Repository<Roles>,
        @InjectRepository(Permissions)
        private readonly permissionRepo: Repository<Permissions>,
        @InjectRepository(UserRoles)
        private readonly userRoleRepo: Repository<UserRoles>,
        private readonly userPermissionService: UserPermissionService,
    ) { }

    async assignDefaultRoleAndPermissions(userId: string, roleType?: RoleType): Promise<void> {
        const roleName = roleType || DEFAULT_ROLE;
        await this.assignRoleToUser(userId, roleName);
        await this.assignDefaultPermissions(userId, roleName);
    }

    private async assignRoleToUser(userId: string, roleName: string): Promise<void> {
        const role = await this.roleRepo.findOne({ where: { name: roleName } });
        if (!role) {
            throw new Error(`Role '${roleName}' not found`);
        }
        await this.userRoleRepo.delete({ userId });
        const userRole = this.userRoleRepo.create({
            userId,
            roleId: role.id
        });

        await this.userRoleRepo.save(userRole);
    }

    private async assignDefaultPermissions(userId: string, roleName: string): Promise<void> {
        const roleConfig = DEFAULT_PERMISSIONS_CONFIG[roleName as RoleType];
        if (!roleConfig) {
            console.warn(`No permission configuration found for role: ${roleName}`);
            return;
        }

        const permissionNames = [...roleConfig];
        if (permissionNames.length === 0) {
            return;
        }
        const permissions = await this.permissionRepo.find({
            where: permissionNames.map(name => ({ name }))
        });

        const foundPermissionNames = permissions.map(p => p.name);
        const missingPermissions = permissionNames.filter(name => !foundPermissionNames.includes(name));

        if (missingPermissions.length > 0) {
            console.warn(`Missing permissions in database: ${missingPermissions.join(', ')}`);
        }
        if (permissions.length > 0) {
            await this.userPermissionService.bulkAssignPermissions({
                userId,
                permissionIds: permissions.map(p => p.id),
                grantedBy: undefined
            });
        }
    }

    async changeUserRole(userId: string, newRoleName: string, grantedBy?: string): Promise<void> {
        await this.userPermissionService.removeAllUserPermissions(userId);
        await this.assignDefaultRoleAndPermissions(userId, newRoleName as RoleType);
    }

    async addPermissionToUser(userId: string, permissionName: string, grantedBy?: string): Promise<void> {
        const permission = await this.permissionRepo.findOne({ where: { name: permissionName } });
        if (!permission) {
            throw new Error(`Permission '${permissionName}' not found`);
        }

        await this.userPermissionService.assignPermissionToUser({
            userId,
            permissionId: permission.id,
            grantedBy
        });
    }

    async removePermissionFromUser(userId: string, permissionName: string): Promise<void> {
        const permission = await this.permissionRepo.findOne({ where: { name: permissionName } });
        if (!permission) {
            throw new Error(`Permission '${permissionName}' not found`);
        }

        await this.userPermissionService.removePermissionFromUser(userId, permission.id);
    }
}
