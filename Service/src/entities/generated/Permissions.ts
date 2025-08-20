import { Column, Entity, Index, OneToMany } from "typeorm";
import { UserPermissions } from "./UserPermissions";

@Index("permissions_pkey", ["id"], { unique: true })
@Index("idx_permissions_active", ["isActive"], {})
@Index("idx_permissions_key", ["permissionKey"], {})
@Index("permissions_permission_key_key", ["permissionKey"], { unique: true })
@Index("idx_permissions_type", ["type"], {})
@Entity("permissions", { schema: "public" })
export class Permissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", {
    name: "permission_key",
    unique: true,
    length: 100,
  })
  permissionKey: string;

  @Column("character varying", { name: "name", length: 150 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("character varying", {
    name: "type",
    length: 20,
    default: () => "'ACTION'",
  })
  type: string;

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
