import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Index("menus_pkey", ["id"], { unique: true })
@Index("idx_menus_active", ["isActive"], {})
@Index("idx_menus_parent_id", ["parentId"], {})
@Index("idx_menus_permission_id", ["permissionId"], {})
@Index("idx_menus_route", ["route"], {})
@Index("idx_menus_sort_order", ["sortOrder"], {})
@Entity("menus", { schema: "public" })
export class Menus {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "title", length: 50 })
  title: string;

  @Column("character varying", {
    name: "description",
    nullable: true,
    length: 200,
  })
  description: string | null;

  @Column("uuid", { name: "parent_id", nullable: true })
  parentId: string | null;

  @Column("character varying", { name: "route", nullable: true, length: 200 })
  route: string | null;

  @Column("uuid", { name: "permission_id", nullable: true })
  permissionId: string | null;

  @Column("integer", { name: "sort_order", nullable: true, default: () => "1" })
  sortOrder: number | null;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive: boolean;

  @Column("uuid", { name: "created_by" })
  createdBy: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("uuid", { name: "updated_by", nullable: true })
  updatedBy: string | null;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => Menus, (menus) => menus.menus)
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: Menus;

  @OneToMany(() => Menus, (menus) => menus.parent)
  menus: Menus[];
}
