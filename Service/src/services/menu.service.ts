import { Injectable } from '@nestjs/common';
import { MenuRepository } from '../repositories/menu.repository';
import { UserPermissionRepository } from '../repositories/user-permission.repository';
import { Menus } from '../entities/generated/Menus';
import { DEFAULT_MENUS_BY_ROLE, UserRole } from '../common/config/default-permissions.config';
import { Users } from 'src/entities/generated/Users';

@Injectable()
export class MenuService {
    constructor(
        private readonly menuRepository: MenuRepository,
        private readonly userPermissionRepository: UserPermissionRepository,
    ) { }

    async getMenusByUserWithRoles(userId: string): Promise<Menus[]> {
        const userPermissions = await this.userPermissionRepository.getUserPermissions(userId);

        if (!userPermissions.length) {
            return [];
        }

        const permissionIds = userPermissions.map((up: any) => up.permissionId);
        const menus = await this.menuRepository.findMenusByUserPermissions(permissionIds);

        return this.buildMenuHierarchy(menus);
    }

    async assignMenusToUser(userId: string, roleName: string): Promise<void> {
        const role = roleName as UserRole;
        const menuKeys = DEFAULT_MENUS_BY_ROLE[role] || [];

        if (!menuKeys.length) {
            return;
        }
        const permissionKeys = menuKeys.map(key => `MENU_${key}`);
        await this.userPermissionRepository.assignPermissionsByKeys(userId, permissionKeys);
    }

    async updateMenu(menuId: string, menuData: Partial<Menus>, updatedBy: Users): Promise<Menus> {
        await this.menuRepository.update(menuId, {
            ...menuData,
            updatedBy: updatedBy
        });

        const updatedMenu = await this.menuRepository.findById(menuId);
        if (!updatedMenu) {
            throw new Error('Menu not found after update');
        }

        return updatedMenu;
    }

    async deleteMenu(menuId: string): Promise<void> {
        await this.menuRepository.softDelete(menuId);
    }

    private buildMenuHierarchy(menus: Menus[]): Menus[] {
        const menuMap = new Map<string, Menus>();
        const rootMenus: Menus[] = [];
        menus.forEach(menu => {
            menuMap.set(menu.id, { ...menu, children: [] });
        });

        menus.forEach(menu => {
            const menuWithChildren = menuMap.get(menu.id)!;

            if (menu.parentId) {
                const parent = menuMap.get(menu.parentId);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(menuWithChildren);
                } else {
                    rootMenus.push(menuWithChildren);
                    rootMenus.push(menuWithChildren);
                }
            } else {
                rootMenus.push(menuWithChildren);
            }
        });

        return rootMenus;
    }
}

declare module '../entities/generated/Menus' {
    interface Menus {
        children?: Menus[];
    }
}
