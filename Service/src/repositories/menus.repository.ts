import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Menus } from "src/entities/generated/Menus";
import { Repository } from "typeorm";

@Injectable()
export class MenuRepository {
    constructor(
        @InjectRepository(Menus)
        private readonly menuRepo: Repository<Menus>,
    ) { }

    async create(menuData: Partial<Menus>): Promise<Menus> {
        const menu = this.menuRepo.create(menuData);
        return await this.menuRepo.save(menu);
    }

    async findById(id: string): Promise<Menus | null> {
        return await this.menuRepo.findOne({ where: { id } });
    }

    async findAll(): Promise<Menus[]> {
        return await this.menuRepo.find();
    }

    async findByPermissions(permission_ids: string[]): Promise<Menus[]> {
        return await this.menuRepo
            .createQueryBuilder('m')
            .innerJoin('menus', 'mn', 'm.parent_id = mn.id')
            .select([
            'm.id',
            'mn.title as menu',
            'm.title as sub_menu',
            'm.route',
            'm.sort_order',
            'm.created_by',
            'm.created_at',
            'm.updated_by',
            'm.updated_at'
            ])
            .where('m.permission_id IN (:...permission_ids)', { permission_ids })
            .orderBy('mn.sort_order', 'ASC')
            .addOrderBy('m.sort_order', 'ASC')
            .getRawMany();
    }

    async update(id: string, menuData: Partial<Menus>): Promise<Menus | null> {
        await this.menuRepo.update(id, menuData);
        return this.findById(id);
    }

    async delete(id: string): Promise<void> {
        await this.menuRepo.delete(id);
    }
}
