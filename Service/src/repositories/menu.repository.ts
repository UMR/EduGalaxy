import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menus } from '../entities/generated/Menus';

@Injectable()
export class MenuRepository {
    constructor(
        @InjectRepository(Menus)
        private readonly menuRepo: Repository<Menus>,
    ) { }

    async findMenusByUserPermissions(permissionIds: string[]): Promise<Menus[]> {
        if (!permissionIds.length) {
            return [];
        }

        return await this.menuRepo
            .createQueryBuilder('menu')
            .where('menu.permission_id IN (:...permissionIds)', { permissionIds })
            .andWhere('menu.is_active = :isActive', { isActive: true })
            .orderBy('menu.sort_order', 'ASC')
            .getMany();
    }

    async findById(id: string): Promise<Menus | null> {
        return await this.menuRepo.findOne({
            where: { id, isActive: true }
        });
    }

    async findAll(): Promise<Menus[]> {
        return await this.menuRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' }
        });
    }

    async create(menuData: Partial<Menus>): Promise<Menus> {
        const menu = this.menuRepo.create(menuData);
        return await this.menuRepo.save(menu);
    }

    async update(id: string, menuData: Partial<Menus>): Promise<void> {
        await this.menuRepo.update(id, {
            ...menuData,
            updatedAt: new Date()
        });
    }

    async softDelete(id: string): Promise<void> {
        await this.menuRepo.update(id, {
            isActive: false,
            updatedAt: new Date()
        });
    }

    async findByTitle(title: string): Promise<Menus | null> {
        return await this.menuRepo.findOne({
            where: { title, isActive: true }
        });
    }

    async findAdminMenu(): Promise<Menus | null> {
        return await this.menuRepo.findOne({
            where: {
                title: 'Administration',
                route: '/admin',
                isActive: true
            }
        });
    }
}
