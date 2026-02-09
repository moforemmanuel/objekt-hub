import { ApiProperty } from '@nestjs/swagger';

export class FailureResponse {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  status: number;

  @ApiProperty({ description: 'Error message', example: 'Validation failed' })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    nullable: true,
    example: { email: ['Email is required'] },
  })
  error: string | Record<string, unknown> | null;
}
