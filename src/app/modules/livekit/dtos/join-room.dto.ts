import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class JoinRoomDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Test-Room',
  })
  @IsNotEmpty()
  @IsString()
  readonly roomName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'user1234',
  })
  @IsNotEmpty()
  @IsString()
  readonly identity!: string;

  @IsOptional()
  @IsNumber()
  readonly createdBy!: any;
}
