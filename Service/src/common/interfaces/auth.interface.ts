import { IRole, IPermission } from './rbac.interface';

export interface IAuthPayload {
    sub: string;
    email: string;
    username: string;
    role: string;
    permissions: string[];
    iat?: number;
    exp?: number;
}

export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        username: string;
        role: IRole;
        permissions: IPermission[];
        menus: any[];
    };
}

export interface ITokens {
    accessToken: string;
    refreshToken: string;
}
