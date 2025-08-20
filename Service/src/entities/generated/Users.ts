import { Column, Entity, Index, OneToMany } from "typeorm";
import { UserRoles } from "./UserRoles";

@Index("idx_users_email", ["email"], {})
@Index("users_email_key", ["email"], { unique: true })
@Index("users_pkey", ["id"], { unique: true })
@Index("idx_users_active", ["isActive"], {})
@Index("idx_users_username", ["username"], {})
@Index("users_username_key", ["username"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("character varying", { name: "username", unique: true, length: 100 })
  username: string;

  @Column("character varying", { name: "password", length: 255 })
  password: string;

  @Column("character varying", {
    name: "first_name",
    nullable: true,
    length: 100,
  })
  firstName: string | null;

  @Column("character varying", {
    name: "last_name",
    nullable: true,
    length: 100,
  })
  lastName: string | null;

  @Column("character varying", { name: "phone", nullable: true, length: 20 })
  phone: string | null;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive: boolean;

  @Column("boolean", { name: "email_verified", default: () => "false" })
  emailVerified: boolean;

  @Column("timestamp without time zone", {
    name: "last_login_at",
    nullable: true,
  })
  lastLoginAt: Date | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp without time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles: UserRoles[];
}
