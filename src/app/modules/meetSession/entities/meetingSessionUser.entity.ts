import { BaseEntity } from "@src/app/base";
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ENUM_MEETING_ENTRY_APPROVAL_STATUS } from "../enums";
import { MeetingSession } from "./meetSession.entity";

@Entity(ENUM_TABLE_NAMES.MEETING_SESSION_USER)
export class MeetingSessionUser extends BaseEntity {
  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
  })
  approvalType?: ENUM_MEETING_ENTRY_APPROVAL_STATUS;

  @ManyToOne((t) => MeetingSession)
  meetingSession?: MeetingSession;

  @ManyToOne((t) => User)
  user?: User;
}
