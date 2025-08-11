import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/generated/Users';
import { Roles } from '../entities/generated/Roles';
import { UserNotFoundException, UserAlreadyExistsException } from '../common/exceptions/auth.exceptions';

interface IUserCreateData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleId: string;
}

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,
        @InjectRepository(Roles)
        private readonly roleRepo: Repository<Roles>,
    ) { }

    async create(userData: IUserCreateData): Promise<Users> {
        // Check if user already exists
        const existingByEmail = await this.userRepo.findOne({ where: { email: userData.email } });
        if (existingByEmail) {
            throw new UserAlreadyExistsException('email');
        }

        const existingByUsername = await this.userRepo.findOne({ where: { username: userData.username } });
        if (existingByUsername) {
            throw new UserAlreadyExistsException('username');
        }

        const user = this.userRepo.create(userData);
        return await this.userRepo.save(user);
    }

    async findById(id: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { id },
            relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
        });
    }

    async findByEmail(email: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { email },
            relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
        });
    }

    async findByUsername(username: string): Promise<Users | null> {
        return await this.userRepo.findOne({
            where: { username },
            relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
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
        return await this.userRepo.find({
            where: { role: { name: roleName } },
            relations: ['role']
        });
    }

    async findActiveUsers(): Promise<Users[]> {
        return await this.userRepo.find({
            where: { isActive: true },
            relations: ['role']
        });
    }

    async findRoleByName(roleName: string): Promise<Roles | null> {
        return await this.roleRepo.findOne({
            where: { name: roleName },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });
    }

    // Helper method to get user permissions
    getUserPermissions(user: Users): string[] {
        if (!user.role?.rolePermissions) {
            return [];
        }
        return user.role.rolePermissions.map(rp => rp.permission.name);
    }
}
