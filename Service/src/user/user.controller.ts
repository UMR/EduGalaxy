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
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles, RequireAnyPermission, RequireAllPermissions, CurrentUser } from '../auth/decorators';
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
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles('admin')
    @RequireAnyPermission('user:read', 'admin:manage-users')
    @ApiOperation({
        summary: 'Get all users',
        description: 'Requires ADMIN role and either user:read or admin:manage-users permission'
    })
    @SwaggerResponse({ status: 200, description: 'Successfully retrieved all users' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
    async getAllUsers(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<any[]>> {
        return ApiResponse.success(
            [],
            `Hello ${user.username}, you can see all users because you're an admin!`
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
    @UseGuards(PermissionsGuard)
    @RequireAllPermissions('user:create', 'admin:manage-users')
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Requires both user:create and admin:manage-users permissions'
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
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles('admin')
    @RequireAnyPermission('user:delete', 'admin:manage-users')
    @ApiOperation({
        summary: 'Delete a user',
        description: 'Requires ADMIN role and either user:delete or admin:manage-users permission'
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
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles('student')
    @RequireAnyPermission('student:view-courses', 'student:enroll')
    @ApiOperation({
        summary: 'Get student dashboard',
        description: 'Get dashboard data for students. Requires STUDENT role and either student:view-courses or student:enroll permission'
    })
    @SwaggerResponse({ status: 200, description: 'Successfully retrieved student dashboard' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions or not a student' })
    async getStudentDashboard(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<any>> {
        return ApiResponse.success(
            { courses: [], assignments: [] },
            `Welcome to your dashboard, ${user.username}!`
        );
    }

    @Post('enroll/:courseId')
    @UseGuards(PermissionsGuard)
    @RequireAnyPermission('student:enroll')
    @ApiOperation({
        summary: 'Enroll in a course',
        description: 'Enroll the current user in a course. Requires student:enroll permission'
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
