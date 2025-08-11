import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { PasswordService } from '../../common/services/password.service';
import { TokenService } from './token.service';
import { LoginDto, RegisterDto } from '../dto';
import { ILoginResponse, ITokens, IUserResponse, IAuthPayload } from '../../common/interfaces';
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

        // Validate password strength
        const passwordValidation = this.passwordService.validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            throw new ValidationException(passwordValidation.errors);
        }

        // Check if user already exists
        const existingUserByEmail = await this.userRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new UserAlreadyExistsException('email');
        }

        const existingUserByUsername = await this.userRepository.findByUsername(username);
        if (existingUserByUsername) {
            throw new UserAlreadyExistsException('username');
        }

        // Find the role
        const role = await this.userRepository.findRoleByName(roleName);
        if (!role) {
            throw new ValidationException([`Role '${roleName}' not found`]);
        }

        const hashedPassword = await this.passwordService.hashPassword(password);

        const user = await this.userRepository.create({
            email,
            username,
            password: hashedPassword,
            roleId: role.id,
        });

        // Fetch the user with role and permissions
        const userWithDetails = await this.userRepository.findById(user.id);
        return this.toUserResponse(userWithDetails);
    }

    async login(loginDto: LoginDto): Promise<ILoginResponse> {
        const { email, password } = loginDto;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AuthenticationException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AuthenticationException('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationException('Invalid credentials');
        }

        // Get user permissions
        const permissions = this.userRepository.getUserPermissions(user);

        // Generate tokens
        const tokens = await this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role.name,
            permissions: permissions,
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: {
                    id: user.role.id,
                    name: user.role.name,
                    description: user.role.description || undefined,
                    isActive: user.role.isActive || false,
                    createdAt: user.role.createdAt || new Date(),
                    updatedAt: user.role.updatedAt || new Date(),
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

        return this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role.name,
            permissions: permissions,
        });
    }

    async validateUser(userId: string): Promise<IUserResponse | null> {
        const user = await this.userRepository.findById(userId);
        return user ? this.toUserResponse(user) : null;
    }

    private toUserResponse(user: any): IUserResponse {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: {
                id: user.role.id,
                name: user.role.name,
                description: user.role.description || undefined,
                isActive: user.role.isActive || false,
                createdAt: user.role.createdAt || new Date(),
                updatedAt: user.role.updatedAt || new Date(),
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
        if (!user.role?.rolePermissions) {
            return [];
        }
        return user.role.rolePermissions.map((rp: any) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            description: rp.permission.description || undefined,
            resource: rp.permission.resource,
            action: rp.permission.action,
            isActive: rp.permission.isActive || false,
            createdAt: rp.permission.createdAt || new Date(),
            updatedAt: rp.permission.updatedAt || new Date(),
        }));
    }
}
