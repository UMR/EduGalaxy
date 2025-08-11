import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthPayload } from '../../common/interfaces';
import { UserRepository } from '../../repositories/user.repository';
import { AuthenticationException } from '../../common/exceptions/auth.exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
        });
    }

    async validate(payload: IAuthPayload): Promise<IAuthPayload> {
        const user = await this.userRepository.findById(payload.sub);

        if (!user || !user.isActive) {
            throw new AuthenticationException('User not found or inactive');
        }

        return payload;
    }
}
