import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class UploadFileDto {
  @ApiProperty({
    type: "array",
    items: {
      type: "string",
      format: "binary",
    },
    required: false,
  })
  files: any[];

  @ApiProperty({
    type: "string",
    pattern: "^[a-z0-9-]+$",
    example: "default",
    required: false,
  })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Folder name must contain only lowercase letters, numbers, and hyphens.",
  })
  folder: string;
}
