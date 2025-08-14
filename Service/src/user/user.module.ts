import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { Users } from 'src/entities/generated/Users';
import { Roles } from 'src/entities/generated/Roles';
import { UserRoles } from 'src/entities/generated/UserRoles';
import { Permissions } from 'src/entities/generated/Permissions';
import { UserPermissions } from 'src/entities/generated/UserPermissions';
import { Courses } from 'src/entities/generated/Courses';
import { Enrollments } from 'src/entities/generated/Enrollments';

@Module({
    imports: [
        TypeOrmModule.forFeature([Users, Roles, UserRoles, Permissions, UserPermissions, Courses, Enrollments]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET', 'default-access-secret'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
                },
            }),
            inject: [ConfigService],
        }),
        AuthModule
    ],
    controllers: [UserController],
})
export class UserModule { }
