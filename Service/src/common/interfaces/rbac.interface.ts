export interface IRole {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoleCreate {
    name: string;
    description?: string;
}

export interface IRoleUpdate {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface IPermission {
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPermissionCreate {
    name: string;
    description?: string;
    resource: string;
    action: string;
}

export interface IPermissionUpdate {
    name?: string;
    description?: string;
    resource?: string;
    action?: string;
    isActive?: boolean;
}

export interface IRolePermission {
    id: string;
    roleId: string;
    permissionId: string;
    grantedAt: Date;
    grantedBy?: string;
}

export interface IRoleWithPermissions extends IRole {
    permissions: IPermission[];
}

export interface IUserWithRole {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: IRoleWithPermissions;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
