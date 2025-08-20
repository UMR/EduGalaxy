import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermissions } from '../entities/generated/UserPermissions';
import { Users } from '../entities/generated/Users';
import { Permissions } from '../entities/generated/Permissions';

export interface ICreateUserPermissionData {
    userId: string;
    permissionId: string;
    grantedBy?: string;
}

@Injectable()
export class UserPermissionRepository {
    constructor(
        @InjectRepository(UserPermissions)
        private readonly userPermissionRepo: Repository<UserPermissions>,
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,
        @InjectRepository(Permissions)
        private readonly permissionRepo: Repository<Permissions>,
    ) { }

    async create(data: ICreateUserPermissionData): Promise<UserPermissions> {
        // Check if permission already exists for this user
        const existing = await this.userPermissionRepo.findOne({
            where: {
                userId: data.userId,
                permissionId: data.permissionId
            }
        });

        if (existing) {
            return existing;
        }

        const userPermission = this.userPermissionRepo.create({
            userId: data.userId,
            permissionId: data.permissionId,
            grantedAt: new Date()
        });

        return await this.userPermissionRepo.save(userPermission);
    }

    async findByUserId(userId: string): Promise<UserPermissions[]> {
        return await this.userPermissionRepo.find({
            where: { userId },
            relations: ['permission']
        });
    }

    async findByPermissionId(permissionId: string): Promise<UserPermissions[]> {
        return await this.userPermissionRepo.find({
            where: { permissionId },
            relations: ['user']
        });
    }

    async removePermission(userId: string, permissionId: string): Promise<boolean> {
        const result = await this.userPermissionRepo.delete({
            userId,
            permissionId
        });
        return (result.affected ?? 0) > 0;
    }

    async removeAllUserPermissions(userId: string): Promise<boolean> {
        const result = await this.userPermissionRepo.delete({ userId });
        return (result.affected ?? 0) >= 0;
    }

    async bulkAssignPermissions(userId: string, permissionIds: string[], grantedBy?: string): Promise<UserPermissions[]> {
        const userPermissions: UserPermissions[] = [];

        for (const permissionId of permissionIds) {
            try {
                const userPermission = await this.create({
                    userId,
                    permissionId,
                    grantedBy
                });
                userPermissions.push(userPermission);
            } catch (error) {
                // Continue with other permissions if one fails
                console.error(`Failed to assign permission ${permissionId} to user ${userId}:`, error);
            }
        }

        return userPermissions;
    }

    async getUsersWithPermission(permissionName: string): Promise<any[]> {
        return await this.userPermissionRepo
            .createQueryBuilder('up')
            .innerJoin('up.permission', 'permission')
            .innerJoin('up.user', 'user')
            .where('permission.name = :permissionName', { permissionName })
            .select([
                'user.id as userId',
                'user.username as username',
                'user.email as email',
                'up.grantedAt as grantedAt'
            ])
            .getRawMany();
    }

    async getAllUserPermissions(): Promise<UserPermissions[]> {
        return await this.userPermissionRepo.find({
            relations: ['user', 'permission']
        });
    }

    async hasPermission(userId: string, permissionName: string): Promise<boolean> {
        const count = await this.userPermissionRepo
            .createQueryBuilder('up')
            .innerJoin('up.permission', 'permission')
            .where('up.userId = :userId', { userId })
            .andWhere('permission.name = :permissionName', { permissionName })
            .getCount();

        return count > 0;
    }

    async findById(id: string): Promise<UserPermissions | null> {
        return await this.userPermissionRepo.findOne({
            where: { id },
            relations: ['user', 'permission']
        });
    }

    async update(id: string, updateData: Partial<UserPermissions>): Promise<UserPermissions | null> {
        await this.userPermissionRepo.update(id, updateData);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userPermissionRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async getUserPermissions(userId: string): Promise<UserPermissions[]> {
        return await this.userPermissionRepo.find({
            where: { userId },
            relations: ['permission']
        });
    }

    async assignPermissionsByKeys(userId: string, permissionKeys: string[]): Promise<void> {
        const permissions = await this.permissionRepo.find({
            where: permissionKeys.map(key => ({ permissionKey: key }))
        });

        if (!permissions.length) {
            console.warn(`No permissions found for keys: ${permissionKeys.join(', ')}`);
            return;
        }

        const permissionIds = permissions.map(p => p.id);
        await this.bulkAssignPermissions(userId, permissionIds);
    }
}
