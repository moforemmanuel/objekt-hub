import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse<T> {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  status: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation successful',
  })
  message: string;

  @ApiProperty({ description: 'Response data', nullable: true })
  data: T | null;
}
