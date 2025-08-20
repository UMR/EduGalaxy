import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Permissions } from "./Permissions";

@Index("user_permissions_pkey", ["id"], { unique: true })
@Index("idx_user_permissions_permission_id", ["permissionId"], {})
@Index("uk_user_permission", ["permissionId", "userId"], { unique: true })
@Index("idx_user_permissions_user_id", ["userId"], {})
@Entity("user_permissions", { schema: "public" })
export class UserPermissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "user_id", unique: true })
  userId: string;

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

  @ManyToOne(() => Permissions, (permissions) => permissions.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;
}
