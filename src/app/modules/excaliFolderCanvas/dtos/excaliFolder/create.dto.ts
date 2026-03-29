import { ApiProperty } from "@nestjs/swagger";
import { BaseCreateDTO } from "@src/app/base";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateExcaliFolderDTO extends BaseCreateDTO {
  @ApiProperty({
    description: "Folder name",
    example: "Sprint planning",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly name!: string;
}
