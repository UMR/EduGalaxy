import { Column, Entity, Index, OneToMany } from "typeorm";
import { UserPermissions } from "./UserPermissions";

@Index("idx_permissions_resource_action", ["action", "resource"], {})
@Index("permissions_pkey", ["id"], { unique: true })
@Index("idx_permissions_active", ["isActive"], {})
@Index("idx_permissions_name", ["name"], {})
@Index("permissions_name_key", ["name"], { unique: true })
@Entity("permissions", { schema: "public" })
export class Permissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("character varying", { name: "resource", length: 50 })
  resource: string;

  @Column("character varying", { name: "action", length: 50 })
  action: string;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp without time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @OneToMany(
    () => UserPermissions,
    (userPermissions) => userPermissions.permission
  )
  userPermissions: UserPermissions[];
}
