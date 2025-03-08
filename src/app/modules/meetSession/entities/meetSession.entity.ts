import { BaseEntity } from "@src/app/base";
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Column, Entity } from "typeorm";
import { ENUM_MEETING_SESSION_TYPE } from "../enums";

@Entity(ENUM_TABLE_NAMES.MEETING_SESSION)
export class MeetingSession extends BaseEntity {
  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 256,
    unique: true,
  })
  roomName?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    default: ENUM_MEETING_SESSION_TYPE.public,
  })
  sessionType?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.BOOLEAN,
    default: false,
  })
  sessionEnded?: boolean;
}
