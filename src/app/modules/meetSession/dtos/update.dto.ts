import { ApiProperty } from "@nestjs/swagger";
import { BaseUpdateDTO } from "@src/app/base";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateMeetingSessionDTO extends BaseUpdateDTO {
  @ApiProperty({
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  sessionEnded: boolean;
}
