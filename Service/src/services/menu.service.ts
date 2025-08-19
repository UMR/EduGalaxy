import { Injectable } from "@nestjs/common";
import { MenuRepository } from "src/repositories/menus.repository";
import { UserPermissionService } from "./user-permission.service";

@Injectable()
export class MenuService{
    constructor(
        private readonly menuRepository: MenuRepository,
        private readonly userPermissionService: UserPermissionService 
    ) { }

    async getMenusByUserId(userId: string): Promise<any[]> {
        const permissions = await this.userPermissionService.getUserDirectPermissions(userId);
        const permissionIds = permissions.map((permission:any) => permission.id);

        if (permissionIds.length === 0) {
            return [];
        }

        return await this.menuRepository.findByPermissions(permissionIds);
    }
}