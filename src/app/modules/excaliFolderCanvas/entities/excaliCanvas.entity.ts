import { BaseEntity } from "@src/app/base";
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ExcaliFolder } from "./excaliFolder.entity";

@Entity(ENUM_TABLE_NAMES.EXCALI_CANVAS)
export class ExcaliCanvas extends BaseEntity {

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  name: string

  @Column({ type: "simple-json", nullable: false })
  canvasData: Record<string, unknown>

  @ManyToOne((t) => User)
  user?: User;

  @RelationId((e: ExcaliCanvas) => e.user)
  userId?: number;

  @ManyToOne((t) => ExcaliFolder, { onDelete: "CASCADE" })
  folder?: ExcaliFolder;

  @RelationId((e: ExcaliCanvas) => e.folder)
  folderId?: number;
}
