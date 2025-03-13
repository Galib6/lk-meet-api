import { ApiProperty } from "@nestjs/swagger";
import { BaseCreateDTO } from "@src/app/base";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ENUM_MEETING_SESSION_TYPE } from "../enums";

export class CreateMeetingSessionDTO extends BaseCreateDTO {
  @ApiProperty({
    description: "Type of the meeting session",
    enum: ENUM_MEETING_SESSION_TYPE,
    default: ENUM_MEETING_SESSION_TYPE.public,
  })
  @IsString()
  @IsEnum(ENUM_MEETING_SESSION_TYPE)
  @IsNotEmpty()
  sessionType?: string = ENUM_MEETING_SESSION_TYPE.public;
}

export class RequestMeetingSessionDTO extends BaseCreateDTO {
  @ApiProperty({
    description: "Name of the room for the meeting session",
    example: "Room123",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  roomName?: string;
}

export class GetMeetingSessionRequest {
  @ApiProperty({
    description: "Name of the room for the meeting session",
    example: "Room123",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  roomName?: string;
}
