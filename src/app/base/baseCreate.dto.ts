import { IsNumber, IsOptional } from "class-validator";

export class BaseCreateDTO {
  // @ApiProperty({
  //   type: Boolean,
  //   required: false,
  //   example: true,
  // })
  // @IsOptional()
  // @IsBoolean()
  // readonly isActive: boolean = true;

  @IsOptional()
  @IsNumber()
  readonly createdBy!: any;
}
