import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Users } from "./Users";
import { Permissions } from "./Permissions";

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
    default: () => "uuid_generate_v4()",
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

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => Users, (users) => users.menus, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Menus, (menus) => menus.menus, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: Menus;

  @OneToMany(() => Menus, (menus) => menus.parent)
  menus: Menus[];

  @ManyToOne(() => Permissions, (permissions) => permissions.menus)
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;

  @ManyToOne(() => Users, (users) => users.menus2, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;
}
