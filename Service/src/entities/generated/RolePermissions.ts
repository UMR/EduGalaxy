import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Permissions } from "./Permissions";
import { Roles } from "./Roles";

@Index("idx_role_permissions_granted_at", ["grantedAt"], {})
@Index("role_permissions_pkey", ["id"], { unique: true })
@Index("uk_role_permission", ["permissionId", "roleId"], { unique: true })
@Index("idx_role_permissions_permission_id", ["permissionId"], {})
@Index("idx_role_permissions_role_id", ["roleId"], {})
@Entity("role_permissions", { schema: "public" })
export class RolePermissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "role_id", unique: true })
  roleId: string;

  @Column("uuid", { name: "permission_id", unique: true })
  permissionId: string;

  @Column("timestamp without time zone", {
    name: "granted_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  grantedAt: Date | null;

  @Column("uuid", { name: "granted_by", nullable: true })
  grantedBy: string | null;

  @ManyToOne(() => Permissions, (permissions) => permissions.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;

  @ManyToOne(() => Roles, (roles) => roles.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Roles;
}
