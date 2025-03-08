import { Role } from "@src/app/modules/acl/entities/role.entity";
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Type } from "class-transformer";
import { Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { User } from "./user.entity";

@Entity(ENUM_TABLE_NAMES.USER_ROLES)
export class UserRole {
  public static readonly SEARCH_TERMS: string[] = [];

  @PrimaryGeneratedColumn("increment", { type: ENUM_COLUMN_TYPES.INT })
  id?: number;

  @ManyToOne((t) => Role, { onDelete: "CASCADE" })
  @Type((t) => Role)
  role?: Role;

  @ManyToOne((t) => User, { onDelete: "CASCADE" })
  @Type((t) => User)
  user?: User;

  @RelationId((e: UserRole) => e.role)
  roleId?: number;

  @RelationId((e: UserRole) => e.user)
  userId?: number;
}
