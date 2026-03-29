import { ApiProperty } from "@nestjs/swagger";
import { BaseUpdateDTO } from "@src/app/base";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateExcaliFolderDTO extends BaseUpdateDTO {
  @ApiProperty({
    description: "Folder name",
    example: "Sprint planning",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  readonly name?: string;
}
