import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../entities/generated/Roles';
import { Permissions } from '../../entities/generated/Permissions';
import { RolePermissions } from '../../entities/generated/RolePermissions';

@Injectable()
export class RolePermissionService {
    constructor(
        @InjectRepository(Roles)
        private readonly roleRepo: Repository<Roles>,
        @InjectRepository(Permissions)
        private readonly permissionRepo: Repository<Permissions>,
        @InjectRepository(RolePermissions)
        private readonly rolePermissionRepo: Repository<RolePermissions>,
    ) { }

    async getPermissionsByRole(roleName: string): Promise<string[]> {
        const role = await this.roleRepo.findOne({
            where: { name: roleName },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });

        if (!role?.rolePermissions) {
            return [];
        }

        return role.rolePermissions.map(rp => rp.permission.name);
    }

    async getPermissionsByRoleId(roleId: string): Promise<string[]> {
        const role = await this.roleRepo.findOne({
            where: { id: roleId },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });

        if (!role?.rolePermissions) {
            return [];
        }

        return role.rolePermissions.map(rp => rp.permission.name);
    }

    async hasPermission(userRoleName: string, requiredPermission: string): Promise<boolean> {
        const rolePermissions = await this.getPermissionsByRole(userRoleName);
        return rolePermissions.includes(requiredPermission);
    }

    async hasAnyPermission(userRoleName: string, requiredPermissions: string[]): Promise<boolean> {
        const rolePermissions = await this.getPermissionsByRole(userRoleName);
        return requiredPermissions.some(permission =>
            rolePermissions.includes(permission)
        );
    }

    async hasAllPermissions(userRoleName: string, requiredPermissions: string[]): Promise<boolean> {
        const rolePermissions = await this.getPermissionsByRole(userRoleName);
        return requiredPermissions.every(permission =>
            rolePermissions.includes(permission)
        );
    }

    async getAllRoles(): Promise<Roles[]> {
        return await this.roleRepo.find({
            where: { isActive: true }
        });
    }

    async getAllPermissions(): Promise<Permissions[]> {
        return await this.permissionRepo.find({
            where: { isActive: true }
        });
    }

    async getRoleByName(roleName: string): Promise<Roles | null> {
        return await this.roleRepo.findOne({
            where: { name: roleName, isActive: true },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });
    }

    async createRole(name: string, description?: string): Promise<Roles> {
        const role = this.roleRepo.create({
            name,
            description,
            isActive: true
        });
        return await this.roleRepo.save(role);
    }

    async createPermission(
        name: string,
        resource: string,
        action: string,
        description?: string
    ): Promise<Permissions> {
        const permission = this.permissionRepo.create({
            name,
            resource,
            action,
            description,
            isActive: true
        });
        return await this.permissionRepo.save(permission);
    }

    async assignPermissionToRole(roleId: string, permissionId: string, grantedBy?: string): Promise<RolePermissions> {
        // Check if assignment already exists
        const existing = await this.rolePermissionRepo.findOne({
            where: { roleId, permissionId }
        });

        if (existing) {
            return existing;
        }

        const rolePermission = this.rolePermissionRepo.create({
            roleId,
            permissionId,
            grantedBy
        });
        return await this.rolePermissionRepo.save(rolePermission);
    }

    async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
        const result = await this.rolePermissionRepo.delete({
            roleId,
            permissionId
        });
        return (result.affected || 0) > 0;
    }

    async isValidRole(roleName: string): Promise<boolean> {
        const role = await this.roleRepo.findOne({
            where: { name: roleName, isActive: true }
        });
        return !!role;
    }

    async isValidPermission(permissionName: string): Promise<boolean> {
        const permission = await this.permissionRepo.findOne({
            where: { name: permissionName, isActive: true }
        });
        return !!permission;
    }
}
