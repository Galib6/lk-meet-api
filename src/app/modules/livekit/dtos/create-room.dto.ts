import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Test-Room',
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsOptional()
  @IsNumber()
  readonly createdBy!: any;
}
