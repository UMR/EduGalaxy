import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { Users } from 'src/entities/generated/Users';
import { Roles } from 'src/entities/generated/Roles';
import { Permissions } from 'src/entities/generated/Permissions';
import { RolePermissions } from 'src/entities/generated/RolePermissions';
import { Courses } from 'src/entities/generated/Courses';
import { Enrollments } from 'src/entities/generated/Enrollments';

@Module({
    imports: [
        TypeOrmModule.forFeature([Users, Roles, Permissions, RolePermissions, Courses, Enrollments]),
        AuthModule
    ],
    controllers: [UserController],
})
export class UserModule { }
