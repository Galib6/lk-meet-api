import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class GetConnectionDetailsDTO {
  @ApiProperty({
    description:
      'Amount of time before expiration, expressed in seconds or a string describing a time span zeit/ms. eg: "2 days", "10h", or seconds as numeric value',
    required: false,
    type: "string",
  })
  @IsOptional()
  @IsString()
  ttl?: number | string;

  @ApiProperty({
    description:
      "Display name for the participant, available as `Participant.name`",
    required: true,
    type: "string",
  })
  @IsNotEmpty()
  @IsString()
  participantName?: string;

  @ApiProperty({
    description: "Identity of the user, required for room join tokens",
    type: "string",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  identity: string;

  @ApiProperty({
    description: "Custom metadata to be passed to participants",
    required: false,
    type: "string",
  })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiProperty({
    description: "Custom attributes to be passed to participants",
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @ApiProperty({
    description: "Name of the room to join",
    type: "string",
    required: true,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: "roomName can only contain letters, numbers, and hyphens",
  })
  roomName: string;
}
