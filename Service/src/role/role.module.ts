import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RolePermissionService } from '../common/services/role-permission.service';
import { Roles } from '../entities/generated/Roles';
import { Permissions } from '../entities/generated/Permissions';
import { RolePermissions } from '../entities/generated/RolePermissions';

@Module({
    imports: [
        TypeOrmModule.forFeature([Roles, Permissions, RolePermissions])
    ],
    controllers: [RoleController],
    providers: [RolePermissionService],
    exports: [RolePermissionService]
})
export class RoleModule { }
