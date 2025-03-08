import { ApiProperty } from "@nestjs/swagger";
import { BaseCreateDTO } from "@src/app/base";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";
import { ENUM_MEETING_ENTRY_APPROVAL_STATUS } from "../enums";

export class ChangeRequestStatusDTO extends BaseCreateDTO {
  @ApiProperty({
    description: "Name of the room for the meeting session",
    example: "Room123",
  })
  @IsString()
  @IsNotEmpty()
  roomName: string;

  @ApiProperty({
    description: "Array of request IDs to change status",
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  requestsIds: number[];

  @ApiProperty({
    description: "New status for the requests",
    enum: ENUM_MEETING_ENTRY_APPROVAL_STATUS,
    example: ENUM_MEETING_ENTRY_APPROVAL_STATUS.rejected,
  })
  @IsEnum(ENUM_MEETING_ENTRY_APPROVAL_STATUS)
  @IsNotEmpty()
  status: ENUM_MEETING_ENTRY_APPROVAL_STATUS;
}
