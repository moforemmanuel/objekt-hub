import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Username',
    example: 'johndoe_updated',
    minLength: 3,
    maxLength: 30,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  username?: string;
}
