import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MenuService } from '../services/menu.service';
import { MenuController } from '../controllers/menu.controller';
import { MenuRepository } from '../repositories/menu.repository';
import { UserPermissionRepository } from '../repositories/user-permission.repository';
import { RolesPermissionsGuard } from '../auth/guards/roles-permissions.guard';
import { Menus } from '../entities/generated/Menus';
import { Permissions } from '../entities/generated/Permissions';
import { UserPermissions } from '../entities/generated/UserPermissions';
import { Users } from '../entities/generated/Users';
import { UserRoles } from '../entities/generated/UserRoles';
import { Roles } from '../entities/generated/Roles';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Menus,
            Permissions,
            UserPermissions,
            Users,
            UserRoles,
            Roles
        ]),
        forwardRef(() => AuthModule),
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
    controllers: [MenuController],
    providers: [MenuService, MenuRepository, UserPermissionRepository, RolesPermissionsGuard],
    exports: [MenuService]
})
export class MenuModule { }
