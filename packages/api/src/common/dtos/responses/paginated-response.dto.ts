import { ApiProperty } from '@nestjs/swagger';

/**
 * Offset-based pagination metadata
 */
export class OffsetPaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPreviousPage: boolean;
}

/**
 * Cursor-based pagination metadata
 */
export class CursorPaginationMeta {
  @ApiProperty({
    description: 'Cursor for next page',
    example: 'eyJpZCI6IjEyMyJ9',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Cursor for previous page',
    example: 'eyJpZCI6IjEyMiJ9',
    nullable: true,
  })
  previousCursor: string | null;

  @ApiProperty({ description: 'Number of items in current page', example: 10 })
  count: number;

  @ApiProperty({ description: 'Has more items', example: true })
  hasMore: boolean;
}

/**
 * Generic offset-based paginated response
 */
export class OffsetPaginatedResponse<T> {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  status: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Data retrieved successfully',
  })
  message: string;

  @ApiProperty({ description: 'Paginated items', isArray: true })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: OffsetPaginationMeta,
  })
  meta: OffsetPaginationMeta;
}

/**
 * Generic cursor-based paginated response
 */
export class CursorPaginatedResponse<T> {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  status: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Data retrieved successfully',
  })
  message: string;

  @ApiProperty({ description: 'Paginated items', isArray: true })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: CursorPaginationMeta,
  })
  meta: CursorPaginationMeta;
}
