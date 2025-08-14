import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/generated/Users';
import { Roles } from '../entities/generated/Roles';
import { UserRoles } from '../entities/generated/UserRoles';
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
            relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission']
        });
    }

    async findByEmail(email: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { email },
            relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission']
        });
    }

    async findByUsername(username: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { username },
            relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission']
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
            relations: ['role']
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
            relations: ['rolePermissions', 'rolePermissions.permission']
        });
    }

    getUserPermissions(user: Users): string[] {
        if (!user.userRoles || user.userRoles.length === 0) {
            return [];
        }

        const permissions: string[] = [];
        for (const userRole of user.userRoles) {
            if (userRole.role && userRole.role.rolePermissions) {
                userRole.role.rolePermissions.forEach(rp => {
                    if (rp.permission && !permissions.includes(rp.permission.name)) {
                        permissions.push(rp.permission.name);
                    }
                });
            }
        }
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
