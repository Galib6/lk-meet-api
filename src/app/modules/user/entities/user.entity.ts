import { ENUM_AUTH_PROVIDERS } from "@src/app/enums/common.enums";
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Type } from "class-transformer";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { Role } from "../../acl/entities/role.entity";
import { UserRole } from "./userRole.entity";

@Entity(ENUM_TABLE_NAMES.USERS)
export class User {
  public static readonly SEARCH_TERMS: string[] = [
    "email",
    "username",
    "phoneNumber",
    "firstName",
    "lastName",
    "fullName",
  ];

  @PrimaryGeneratedColumn("increment")
  id?: number;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  avatar?: string;

  @Column({ unique: true, nullable: true })
  phoneNumber?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  authProvider?: ENUM_AUTH_PROVIDERS;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, default: false })
  isVerified?: boolean;

  @OneToMany((t) => UserRole, (e) => e.user)
  @Type((t) => UserRole)
  userRoles?: UserRole[];

  @ManyToOne((t) => User, { onDelete: "NO ACTION" })
  @Type((t) => User)
  createdBy?: User;

  @RelationId((e: User) => e.createdBy)
  createdById?: number;

  @ManyToOne((t) => User, { onDelete: "NO ACTION" })
  @Type((t) => User)
  updatedBy?: User;

  @RelationId((e: User) => e.updatedBy)
  updatedById?: number;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: true, nullable: true })
  isActive?: boolean;

  roles?: Role[] = [];
}
