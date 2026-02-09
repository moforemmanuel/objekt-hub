import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateObjectDto {
  @ApiProperty({
    description: 'Object title',
    example: 'My First Object',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Object description',
    example: 'This is a description of my first object',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Image file (jpg, png, gif, max 5MB)',
    type: 'string',
    format: 'binary',
  })
  image: any;
}
