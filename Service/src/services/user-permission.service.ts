import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserPermissionRepository } from '../repositories/user-permission.repository';

export interface IAssignUserPermissionDto {
    userId: string;
    permissionId: string;
    grantedBy?: string;
}

export interface IBulkAssignUserPermissionsDto {
    userId: string;
    permissionIds: string[];
    grantedBy?: string;
}

@Injectable()
export class UserPermissionService {
    constructor(
        private readonly userPermissionRepository: UserPermissionRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async assignPermissionToUser(data: IAssignUserPermissionDto) {
        return await this.userPermissionRepository.create(data);
    }

    async removePermissionFromUser(userId: string, permissionId: string) {
        return await this.userPermissionRepository.removePermission(userId, permissionId);
    }

    async bulkAssignPermissions(data: IBulkAssignUserPermissionsDto) {
        return await this.userPermissionRepository.bulkAssignPermissions(
            data.userId,
            data.permissionIds,
            data.grantedBy
        );
    }

    async removeAllUserPermissions(userId: string) {
        return await this.userPermissionRepository.removeAllUserPermissions(userId);
    }

    async getUserDirectPermissions(userId: string) {
        return await this.userPermissionRepository.findByUserId(userId);
    }

    async getUserAllPermissions(userId: string): Promise<string[]> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }
        return this.userRepository.getUserPermissions(userId);
    }

    async hasPermission(userId: string, permissionName: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return false;
        }

        const permissions = await this.userRepository.getUserPermissions(user.id);
        return permissions.includes(permissionName);
    }

    async getUsersWithPermission(permissionName: string) {
        return await this.userPermissionRepository.getUsersWithPermission(permissionName);
    }

    async getAllUserPermissions() {
        return await this.userPermissionRepository.getAllUserPermissions();
    }

    async replaceUserPermissions(userId: string, permissionIds: string[], grantedBy?: string) {
        // Remove all existing permissions
        await this.userPermissionRepository.removeAllUserPermissions(userId);

        // Assign new permissions
        if (permissionIds.length > 0) {
            return await this.userPermissionRepository.bulkAssignPermissions(
                userId,
                permissionIds,
                grantedBy
            );
        }

        return [];
    }

    async syncUserPermissions(userId: string, permissionNames: string[], grantedBy?: string) {
        // Get permission IDs from names
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }

        // This would need to be implemented with a permission lookup
        // For now, assuming permissionNames are actually IDs
        return await this.replaceUserPermissions(userId, permissionNames, grantedBy);
    }

}