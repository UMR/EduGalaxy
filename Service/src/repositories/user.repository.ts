import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/generated/Users';
import { Roles } from '../entities/generated/Roles';
import { UserRoles } from '../entities/generated/UserRoles';
import { UserPermissions } from '../entities/generated/UserPermissions';
import { UserNotFoundException, UserAlreadyExistsException } from '../common/exceptions/auth.exceptions';

interface IUserCreateData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleNames?: string[];
}

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,
        @InjectRepository(Roles)
        private readonly roleRepo: Repository<Roles>,
        @InjectRepository(UserRoles)
        private readonly userRoleRepo: Repository<UserRoles>,
        @InjectRepository(UserPermissions)
        private readonly userPermissionRepo: Repository<UserPermissions>,
    ) { }

    async create(userData: IUserCreateData): Promise<Users> {
        const existingByEmail = await this.userRepo.findOne({ where: { email: userData.email } });
        if (existingByEmail) {
            throw new UserAlreadyExistsException('email');
        }

        const existingByUsername = await this.userRepo.findOne({ where: { username: userData.username } });
        if (existingByUsername) {
            throw new UserAlreadyExistsException('username');
        }
        const { roleNames, ...userDataWithoutRoles } = userData;
        const user = this.userRepo.create(userDataWithoutRoles);
        const savedUser = await this.userRepo.save(user);
        if (roleNames && roleNames.length > 0) {
            const roles = await this.roleRepo.find({
                where: roleNames.map(name => ({ name }))
            });

            const userRoles = roles.map(role => {
                const userRole = this.userRoleRepo.create({
                    userId: savedUser.id,
                    roleId: role.id
                });
                return userRole;
            });

            await this.userRoleRepo.save(userRoles);
        }
        const userWithRoles = await this.findById(savedUser.id);
        return userWithRoles!;
    }

    async findById(id: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role']
        });
    }

    async findByEmail(email: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { email },
            relations: ['userRoles', 'userRoles.role']
        });
    }

    async findByUsername(username: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { username },
            relations: ['userRoles', 'userRoles.role']
        });
    }

    async update(id: string, updateData: Partial<Users>): Promise<Users> {
        const user = await this.findById(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        Object.assign(user, updateData);
        return await this.userRepo.save(user);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userRepo.delete(id);
        if (result.affected === 0) {
            throw new UserNotFoundException(id);
        }
        return true;
    }

    async findAll(): Promise<Users[]> {
        return await this.userRepo.find({
            relations: ['userRoles', 'userRoles.role']
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.userRepo.count({ where: { email } });
        return count > 0;
    }

    async existsByUsername(username: string): Promise<boolean> {
        const count = await this.userRepo.count({ where: { username } });
        return count > 0;
    }

    async findByRole(roleName: string): Promise<Users[]> {
        return await this.userRepo
            .createQueryBuilder('user')
            .innerJoin('user.userRoles', 'userRole')
            .innerJoin('userRole.role', 'role')
            .where('role.name = :roleName', { roleName })
            .getMany();
    }

    async findActiveUsers(): Promise<Users[]> {
        return await this.userRepo.find({
            where: { isActive: true },
            relations: ['userRoles', 'userRoles.role']
        });
    }

    async findRoleByName(roleName: string): Promise<Roles | null> {
        return await this.roleRepo.findOne({
            where: { name: roleName },
            relations: ['userRoles']
        });
    }

    async getUserPermissions(userId: string): Promise<string[]> {
        const userPermissions = await this.userPermissionRepo.find({
            where: { userId },
            relations: ['permission']
        });

        if (!userPermissions || userPermissions.length === 0) {
            return [];
        }

        const permissions: string[] = [];
        for (const userPermission of userPermissions) {
            if (userPermission.permission && !permissions.includes(userPermission.permission.name)) {
                permissions.push(userPermission.permission.name);
            }
        }
        return permissions;
    }

    async getUserPermissionsAsObjects(userId: string): Promise<any[]> {
        const userPermissions = await this.userPermissionRepo.find({
            where: { userId },
            relations: ['permission']
        });

        if (!userPermissions || userPermissions.length === 0) {
            return [];
        }

        const permissions: any[] = [];
        const permissionIds = new Set<string>();

        userPermissions.forEach((up: any) => {
            if (up.permission && !permissionIds.has(up.permission.id)) {
                permissionIds.add(up.permission.id);
                permissions.push({
                    id: up.permission.id,
                    name: up.permission.name,
                    description: up.permission.description || undefined,
                    resource: up.permission.resource,
                    action: up.permission.action,
                    isActive: up.permission.isActive || false,
                    createdAt: up.permission.createdAt || new Date(),
                    updatedAt: up.permission.updatedAt || new Date(),
                });
            }
        });

        return permissions;
    }

    async assignRolesToUser(userId: string, roleNames: string[]): Promise<void> {
        await this.userRoleRepo.delete({ userId });
        if (roleNames && roleNames.length > 0) {
            const roles = await this.roleRepo.find({
                where: roleNames.map(name => ({ name }))
            });

            const userRoles = roles.map(role => {
                return this.userRoleRepo.create({
                    userId: userId,
                    roleId: role.id
                });
            });

            await this.userRoleRepo.save(userRoles);
        }
    }

    async getUserRoles(userId: string): Promise<Roles[]> {
        const userRoles = await this.userRoleRepo.find({
            where: { userId },
            relations: ['role']
        });

        return userRoles.map(ur => ur.role);
    }
}
