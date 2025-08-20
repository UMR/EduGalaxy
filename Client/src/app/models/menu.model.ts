export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    route?: string;
    url?: string;
    children?: MenuItem[];
    permissions?: string[]; // Required permissions to see this menu item
    roles?: string[]; // Required roles to see this menu item
    isVisible?: boolean;
    isActive?: boolean;
    divider?: boolean;
    badge?: {
        text: string;
        color: string;
    };
}

export interface MenuGroup {
    id: string;
    label: string;
    icon?: string;
    items: MenuItem[];
    permissions?: string[];
    roles?: string[];
    order: number;
}

export interface MenuConfig {
    groups: MenuGroup[];
}

// Server response interface
export interface ServerMenuItem {
    id: string;
    title: string;
    description: string;
    parentId: string | null;
    route: string;
    permissionId: string;
    sortOrder: number;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string | null;
    children: ServerMenuItem[];
}
