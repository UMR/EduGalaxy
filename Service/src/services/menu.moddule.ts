import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from '../services/menu.service';
import { Menus } from '../entities/generated/Menus';
import { Permissions } from '../entities/generated/Permissions';
import { UserPermissions } from '../entities/generated/UserPermissions';
import { UserPermissionService } from './user-permission.service';
 
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserPermissionService,
            MenuService
        ])
    ],
    providers: [MenuService, UserPermissionService],
    exports: [MenuService, UserPermissionService]
})
export class MenuModule { }
 
 