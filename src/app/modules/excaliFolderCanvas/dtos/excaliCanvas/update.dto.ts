import { ApiProperty } from "@nestjs/swagger";
import { BaseUpdateDTO } from "@src/app/base";
import { IsInt, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateExcaliCanvasDTO extends BaseUpdateDTO {
  @ApiProperty({
    description: "Folder id for this canvas",
    example: 3,
    required: false,
  })
  @IsInt()
  @IsOptional()
  readonly folderId?: number;

  @ApiProperty({
    description: "Canvas name",
    example: "Kickoff whiteboard",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  readonly name?: string;

  @ApiProperty({
    description: "Excalidraw canvas payload",
    example: { elements: [], appState: {}, files: {} },
    required: false,
  })
  @IsObject()
  @IsOptional()
  readonly canvasData?: Record<string, unknown>;
}
