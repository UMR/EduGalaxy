import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class UpdateMenuDto {
    @ApiProperty({
        description: 'Menu title',
        example: 'Dashboard',
        required: false
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        description: 'Menu description',
        example: 'Main dashboard and overview',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Menu route/path',
        example: '/dashboard',
        required: false
    })
    @IsOptional()
    @IsString()
    route?: string;

    @ApiProperty({
        description: 'Menu icon',
        example: 'dashboard-icon',
        required: false
    })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({
        description: 'Sort order for menu display',
        example: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @ApiProperty({
        description: 'Parent menu ID (for sub-menus)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    @IsOptional()
    @IsUUID()
    parentId?: string;

    @ApiProperty({
        description: 'Whether the menu is active',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Permission ID required to access this menu',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    @IsOptional()
    @IsUUID()
    permissionId?: string;
}
