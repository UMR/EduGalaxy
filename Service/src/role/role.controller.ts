import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RolePermissionService } from '../common/services/role-permission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiResponse as ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Role Management')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RoleController {
    constructor(private readonly rolePermissionService: RolePermissionService) { }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all roles', description: 'Retrieve all active roles' })
    @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAllRoles() {
        const roles = await this.rolePermissionService.getAllRoles();
        return ApiResponseDto.success(roles, 'Roles retrieved successfully');
    }

    @Get('permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Get all permissions', description: 'Retrieve all active permissions' })
    @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAllPermissions() {
        const permissions = await this.rolePermissionService.getAllPermissions();
        return ApiResponseDto.success(permissions, 'Permissions retrieved successfully');
    }

    @Get(':roleName/permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Get role permissions', description: 'Get all permissions for a specific role' })
    @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getRolePermissions(@Param('roleName') roleName: string) {
        const permissions = await this.rolePermissionService.getPermissionsByRole(roleName);
        return ApiResponseDto.success(permissions, `Permissions for role '${roleName}' retrieved successfully`);
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create new role', description: 'Create a new role in the system' })
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async createRole(@Body() createRoleDto: { name: string; description?: string }) {
        const role = await this.rolePermissionService.createRole(createRoleDto.name, createRoleDto.description);
        return ApiResponseDto.success(role, 'Role created successfully');
    }

    @Post('permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Create new permission', description: 'Create a new permission in the system' })
    @ApiResponse({ status: 201, description: 'Permission created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async createPermission(@Body() createPermissionDto: {
        name: string;
        resource: string;
        action: string;
        description?: string
    }) {
        const permission = await this.rolePermissionService.createPermission(
            createPermissionDto.name,
            createPermissionDto.resource,
            createPermissionDto.action,
            createPermissionDto.description
        );
        return ApiResponseDto.success(permission, 'Permission created successfully');
    }

    @Post(':roleId/permissions/:permissionId')
    @Roles('admin')
    @ApiOperation({ summary: 'Assign permission to role', description: 'Assign a permission to a role' })
    @ApiResponse({ status: 201, description: 'Permission assigned to role successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async assignPermissionToRole(
        @Param('roleId') roleId: string,
        @Param('permissionId') permissionId: string
    ) {
        const assignment = await this.rolePermissionService.assignPermissionToRole(roleId, permissionId);
        return ApiResponseDto.success(assignment, 'Permission assigned to role successfully');
    }
}
