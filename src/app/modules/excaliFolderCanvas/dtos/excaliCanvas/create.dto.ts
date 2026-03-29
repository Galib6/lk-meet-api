import { ApiProperty } from "@nestjs/swagger";
import { BaseCreateDTO } from "@src/app/base";
import { IsArray, IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateExcaliCanvasDTO extends BaseCreateDTO {
  @ApiProperty({
    description: "Folder id for this canvas",
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  readonly folderId!: number;

  @ApiProperty({
    description: "Canvas name",
    example: "Kickoff whiteboard",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly name!: string;

  @ApiProperty({
    description: "Excalidraw canvas payload",
    example: [{ elements: [], appState: {}, files: {} }],
  })
  @IsArray()
  @IsNotEmpty()
  readonly canvasData!: Record<string, unknown>;
}
