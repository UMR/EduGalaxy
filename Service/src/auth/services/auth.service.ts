import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { PasswordService } from '../../common/services/password.service';
import { TokenService } from './token.service';
import { LoginDto, RegisterDto } from '../dto';
import { ILoginResponse, ITokens, IUserResponse } from '../../common/interfaces';
import {
    AuthenticationException,
    UserAlreadyExistsException,
    ValidationException,
} from '../../common/exceptions/auth.exceptions';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) { }

    async register(registerDto: RegisterDto): Promise<IUserResponse> {
        const { email, username, password, roleName = 'student' } = registerDto;
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

        const role = await this.userRepository.findRoleByName(roleName);
        if (!role) {
            throw new ValidationException([`Role '${roleName}' not found`]);
        }

        const hashedPassword = await this.passwordService.hashPassword(password);

        const user = await this.userRepository.create({
            email,
            username,
            password: hashedPassword,
            roleNames: [roleName],
        });
        return this.toUserResponse(user);
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
        const permissions = this.userRepository.getUserPermissions(user);
        const userRoles = user.userRoles || [];
        const primaryRole = userRoles.length > 0 ? userRoles[0].role : null;
        const tokens = await this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: primaryRole?.name || 'guest',
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
                    name: 'guest',
                    description: 'Default guest role',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                permissions: this.getUserPermissionsAsObjects(user),
            },
        };
    }

    async refreshTokens(refreshToken: string): Promise<ITokens> {
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const user = await this.userRepository.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new AuthenticationException('User not found or inactive');
        }

        const permissions = this.userRepository.getUserPermissions(user);
        const userRoles = user.userRoles || [];
        const primaryRole = userRoles.length > 0 ? userRoles[0].role : null;

        return this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: primaryRole?.name || 'guest',
            permissions: permissions,
        });
    }

    async validateUser(userId: string): Promise<IUserResponse | null> {
        const user = await this.userRepository.findById(userId);
        return user ? this.toUserResponse(user) : null;
    }

    private toUserResponse(user: any): IUserResponse {
        const userRoles = user.userRoles || [];
        const primaryRole = userRoles.length > 0 ? userRoles[0].role : null;

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
                name: 'guest',
                description: 'Default guest role',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            permissions: this.getUserPermissionsAsObjects(user),
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private getUserPermissionsAsObjects(user: any): any[] {
        if (!user.userRoles || user.userRoles.length === 0) {
            return [];
        }

        const permissions: any[] = [];
        const permissionIds = new Set<string>();

        for (const userRole of user.userRoles) {
            if (userRole.role?.rolePermissions) {
                userRole.role.rolePermissions.forEach((rp: any) => {
                    if (rp.permission && !permissionIds.has(rp.permission.id)) {
                        permissionIds.add(rp.permission.id);
                        permissions.push({
                            id: rp.permission.id,
                            name: rp.permission.name,
                            description: rp.permission.description || undefined,
                            resource: rp.permission.resource,
                            action: rp.permission.action,
                            isActive: rp.permission.isActive || false,
                            createdAt: rp.permission.createdAt || new Date(),
                            updatedAt: rp.permission.updatedAt || new Date(),
                        });
                    }
                });
            }
        }

        return permissions;
    }
}
