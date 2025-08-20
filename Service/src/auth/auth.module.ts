import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from '../common/services/password.service';
import { RolePermissionAssignmentService } from '../common/services/role-permission-assignment.service';
import { Users } from '../entities/generated/Users';
import { Roles } from '../entities/generated/Roles';
import { UserRoles } from '../entities/generated/UserRoles';
import { Permissions } from '../entities/generated/Permissions';
import { UserPermissions } from '../entities/generated/UserPermissions';
import { UserPermissionService } from '../services/user-permission.service';
import { UserPermissionRepository } from '../repositories/user-permission.repository';
import { MenuModule } from '../modules/menu.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Users, Roles, UserRoles, Permissions, UserPermissions]),
        forwardRef(() => MenuModule),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET', 'default-access-secret'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenService,
        JwtStrategy,
        UserRepository,
        PasswordService,
        RolePermissionAssignmentService,
        UserPermissionService,
        UserPermissionRepository
    ],
    exports: [
        AuthService,
        TokenService,
        UserRepository,
        PasswordService,
        RolePermissionAssignmentService,
        UserPermissionService
    ],
})
export class AuthModule { }
