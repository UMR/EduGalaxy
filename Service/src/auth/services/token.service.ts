import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthPayload, ITokens } from '../../common/interfaces';
import { InvalidTokenException, TokenExpiredException } from '../../common/exceptions/auth.exceptions';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateTokens(payload: Omit<IAuthPayload, 'iat' | 'exp'>): Promise<ITokens> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async generateAccessToken(payload: Omit<IAuthPayload, 'iat' | 'exp'>): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        });
    }

    private async generateRefreshToken(payload: Omit<IAuthPayload, 'iat' | 'exp'>): Promise<string> {
        return this.jwtService.signAsync(
            { sub: payload.sub, email: payload.email },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
            },
        );
    }

    async verifyAccessToken(token: string): Promise<IAuthPayload> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new TokenExpiredException('Access token has expired');
            }
            throw new InvalidTokenException('Invalid access token');
        }
    }

    async verifyRefreshToken(token: string): Promise<{ sub: string; email: string }> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new TokenExpiredException('Refresh token has expired');
            }
            throw new InvalidTokenException('Invalid refresh token');
        }
    }

    extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader) return null;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' && token ? token : null;
    }
}
