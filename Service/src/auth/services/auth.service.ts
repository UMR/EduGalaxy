import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { PasswordService } from '../../common/services/password.service';
import { TokenService } from './token.service';
import { RolePermissionAssignmentService } from '../../common/services/role-permission-assignment.service';
import { LoginDto, RegisterDto } from '../dto';
import { ILoginResponse, ITokens, IUserResponse } from '../../common/interfaces';
import { RoleType } from '../../common/config/default-permissions.config';
import {
    AuthenticationException,
    UserAlreadyExistsException,
    ValidationException,
} from '../../common/exceptions/auth.exceptions';
import { MenuService } from 'src/services/menu.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
        private readonly rolePermissionAssignmentService: RolePermissionAssignmentService,
        private readonly menuService: MenuService
    ) { }

    async register(registerDto: RegisterDto): Promise<IUserResponse> {
        const { email, username, password, roleName } = registerDto;
        const passwordValidation = this.passwordService.validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            throw new ValidationException(passwordValidation.errors);
        }
        const existingUserByEmail = await this.userRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new UserAlreadyExistsException('email');
        }
        const existingUserByUsername = await this.userRepository.findByUsername(username);
        if (existingUserByUsername) {
            throw new UserAlreadyExistsException('username');
        }

        const hashedPassword = await this.passwordService.hashPassword(password);

        const user = await this.userRepository.create({
            email,
            username,
            password: hashedPassword,
        });

        await this.rolePermissionAssignmentService.assignDefaultRoleAndPermissions(
            user.id,
            (roleName as RoleType) || 'student'
        );

        const updatedUser = await this.userRepository.findById(user.id);
        return await this.toUserResponse(updatedUser!);
    }

    async login(loginDto: LoginDto): Promise<ILoginResponse> {
        const { email, password } = loginDto;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AuthenticationException('Invalid credentials');
        }
        
        if (!user.isActive) {
            throw new AuthenticationException('Account is deactivated');
        }
        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationException('Invalid credentials');
        }

        const permissions = await this.userRepository.getUserPermissions(user.id);
        const primaryRole = user.userRoles?.[0]?.role || null;

        const tokens = await this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: primaryRole?.name || 'user',
            permissions: permissions,
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: primaryRole ? {
                    id: primaryRole.id,
                    name: primaryRole.name,
                    description: primaryRole.description || undefined,
                    isActive: primaryRole.isActive || false,
                    createdAt: primaryRole.createdAt || new Date(),
                    updatedAt: primaryRole.updatedAt || new Date(),
                } : {
                    id: '',
                    name: 'user',
                    description: 'Default user role',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                permissions: await this.userRepository.getUserPermissionsAsObjects(user.id),
                menus: await this.menuService.getMenusByUserId(user.id),
            },
        };
    }

    async refreshTokens(refreshToken: string): Promise<ITokens> {
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const user = await this.userRepository.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new AuthenticationException('User not found or inactive');
        }

        const permissions = await this.userRepository.getUserPermissions(user.id);
        const primaryRole = user.userRoles?.[0]?.role || null;

        return this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: primaryRole?.name || 'user',
            permissions: permissions,
        });
    }

    async validateUser(userId: string): Promise<IUserResponse | null> {
        const user = await this.userRepository.findById(userId);
        return user ? await this.toUserResponse(user) : null;
    }

    private async toUserResponse(user: any): Promise<IUserResponse> {
        const primaryRole = user.userRoles?.[0]?.role || null;

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: primaryRole ? {
                id: primaryRole.id,
                name: primaryRole.name,
                description: primaryRole.description || undefined,
                isActive: primaryRole.isActive || false,
                createdAt: primaryRole.createdAt || new Date(),
                updatedAt: primaryRole.updatedAt || new Date(),
            } : {
                id: '',
                name: 'student',
                description: 'Default student role',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            permissions: await this.userRepository.getUserPermissionsAsObjects(user.id),
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
