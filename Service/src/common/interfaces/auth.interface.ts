import { IRole, IPermission } from './rbac.interface';

export interface IAuthPayload {
    sub: string;
    email: string;
    username: string;
    role: string; // role name (string) for JWT payload
    permissions: string[]; // permission names (strings) for JWT payload
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
    };
}

export interface ITokens {
    accessToken: string;
    refreshToken: string;
}
