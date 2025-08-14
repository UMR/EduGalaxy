import {
    Controller,
    Get,
    Post,
    Delete,
    UseGuards,
    Param,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse as SwaggerResponse,
    ApiBearerAuth,
    ApiParam,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesPermissionsGuard } from '../auth/guards/roles-permissions.guard';
import { RequireAnyPermission, RequireAllPermissions, CurrentUser, Roles } from '../auth/decorators';
import { DefaultPermissions, UserRole } from '../common/config/default-permissions.config';
import type { IAuthPayload } from '../common/interfaces';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
export class UserController {
    constructor() { }

    @Get()
    @UseGuards(RolesPermissionsGuard)
    @Roles(UserRole.ADMIN)
    @RequireAnyPermission(DefaultPermissions.MANAGE_USERS, DefaultPermissions.VIEW_ALL_REPORTS)
    @ApiOperation({
        summary: 'Get all users',
        description: 'Requires admin role AND (MANAGE_USERS OR VIEW_ALL_REPORTS) permission'
    })
    @SwaggerResponse({ status: 200, description: 'Successfully retrieved all users' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
    async getAllUsers(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<any[]>> {
        return ApiResponse.success(
            [],
            `Hello ${user.username}, you can see all users!`
        );
    }

    @Get('profile')
    @ApiOperation({
        summary: 'Get own profile',
        description: 'Get the profile of the currently authenticated user'
    })
    @SwaggerResponse({ status: 200, description: 'Successfully retrieved user profile' })
    async getOwnProfile(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<any>> {
        return ApiResponse.success(
            { id: user.sub, email: user.email, username: user.username, role: user.role },
            'Your profile information'
        );
    }

    @Post()
    @UseGuards(RolesPermissionsGuard)
    @Roles(UserRole.ADMIN)
    @RequireAllPermissions(DefaultPermissions.MANAGE_USERS)
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Requires admin role AND MANAGE_USERS permission'
    })
    @SwaggerResponse({ status: 201, description: 'User created successfully' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
    async createUser(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<any>> {
        return ApiResponse.success(
            null,
            `Hello ${user.username}, you can create users!`
        );
    }

    @Delete(':id')
    @UseGuards(RolesPermissionsGuard)
    @Roles(UserRole.ADMIN)
    @RequireAnyPermission(DefaultPermissions.MANAGE_USERS)
    @ApiOperation({
        summary: 'Delete a user',
        description: 'Requires admin role AND MANAGE_USERS permission'
    })
    @ApiParam({ name: 'id', description: 'User ID to delete' })
    @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
    async deleteUser(
        @Param('id') id: string,
        @CurrentUser() user: IAuthPayload
    ): Promise<ApiResponse<any>> {
        return ApiResponse.success(
            null,
            `Hello ${user.username}, you can delete user ${id}!`
        );
    }

    @Get('student-dashboard')
    @UseGuards(RolesPermissionsGuard)
    @Roles(UserRole.STUDENT, UserRole.TEACHER)
    @RequireAnyPermission(DefaultPermissions.VIEW_COURSES, DefaultPermissions.ENROLL_COURSE)
    @ApiOperation({
        summary: 'Get student dashboard',
        description: 'Requires (student OR teacher role) AND (VIEW_COURSES OR ENROLL_COURSE) permission'
    })
    @SwaggerResponse({ status: 200, description: 'Successfully retrieved student dashboard' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
    async getStudentDashboard(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<any>> {
        return ApiResponse.success(
            { courses: [], assignments: [] },
            `Welcome to your dashboard, ${user.username}!`
        );
    }

    @Post('enroll/:courseId')
    @UseGuards(RolesPermissionsGuard)
    @Roles(UserRole.STUDENT)
    @RequireAnyPermission(DefaultPermissions.ENROLL_COURSE)
    @ApiOperation({
        summary: 'Enroll in a course',
        description: 'Requires student role AND ENROLL_COURSE permission'
    })
    @ApiParam({ name: 'courseId', description: 'Course ID to enroll in' })
    @SwaggerResponse({ status: 201, description: 'Successfully enrolled in course' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
    async enrollInCourse(
        @Param('courseId') courseId: string,
        @CurrentUser() user: IAuthPayload
    ): Promise<ApiResponse<any>> {
        return ApiResponse.success(
            null,
            `${user.username} enrolled in course ${courseId}`
        );
    }
}
