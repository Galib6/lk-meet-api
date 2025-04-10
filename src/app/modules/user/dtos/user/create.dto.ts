import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CreateRolesDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly role!: number;
}
export class CreateUserDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: "Galib",
  })
  @IsNotEmpty()
  @IsString()
  readonly firstName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: "test",
  })
  @IsNotEmpty()
  @IsString()
  readonly lastName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: "zahid@gmail.com",
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: "123456",
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password!: string;

  @ApiProperty({
    type: [CreateRolesDTO],
    required: false,
    example: [
      {
        role: "1e276fa4-bab1-4bda-bee2-8bc509960467",
      },
      {
        role: "c10ee33d-20a7-4689-8f80-929963400f7d",
      },
    ],
  })
  @ValidateNested()
  @Type(() => CreateRolesDTO)
  @IsOptional()
  readonly roles!: CreateRolesDTO[];
}
