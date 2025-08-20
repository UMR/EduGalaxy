import { Controller, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesPermissionsGuard } from '../auth/guards/roles-permissions.guard';
import { MenuService } from '../services/menu.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Menus } from '../entities/generated/Menus';
import { UpdateMenuDto } from '../dto/update-menu.dto';

@ApiTags('Menus')
@Controller('menus')
@UseGuards(JwtAuthGuard, RolesPermissionsGuard)
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Get('user')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get user menus',
        description: 'Retrieves all menus available to the authenticated user based on their roles and permissions'
    })
    @ApiResponse({
        status: 200,
        description: 'User menus retrieved successfully',
        type: [Menus]
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
    async getUserMenus(@Request() req: any): Promise<Menus[]> {
        return await this.menuService.getMenusByUserWithRoles(req.user.sub);
    }

    @Put(':id')
    @RequirePermissions(['MENU_SETTINGS'])
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update menu',
        description: 'Updates an existing menu. Requires MENU_SETTINGS permission.'
    })
    @ApiParam({
        name: 'id',
        description: 'Menu ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        description: 'Menu update data',
        type: UpdateMenuDto
    })
    @ApiResponse({
        status: 200,
        description: 'Menu updated successfully',
        type: Menus
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions (MENU_SETTINGS required)' })
    async updateMenu(
        @Param('id') id: string,
        @Body() menuData: UpdateMenuDto,
        @Request() req: any
    ): Promise<Menus> {
        return await this.menuService.updateMenu(id, menuData, req.user);
    }

    @Delete(':id')
    @RequirePermissions(['MENU_SETTINGS'])
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Delete menu',
        description: 'Soft deletes a menu by setting isActive to false. Requires MENU_SETTINGS permission.'
    })
    @ApiParam({
        name: 'id',
        description: 'Menu ID to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Menu deleted successfully'
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions (MENU_SETTINGS required)' })
    async deleteMenu(@Param('id') id: string): Promise<void> {
        return await this.menuService.deleteMenu(id);
    }
}
