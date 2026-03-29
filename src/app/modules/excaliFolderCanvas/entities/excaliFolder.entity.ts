import { BaseEntity } from "@src/app/base";
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity(ENUM_TABLE_NAMES.EXCALI_FOLDERS)
export class ExcaliFolder extends BaseEntity {

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  name: string

  @ManyToOne((t) => User)
  user?: User;

  @RelationId((e: ExcaliFolder) => e.user)
  userId?: number;
}
