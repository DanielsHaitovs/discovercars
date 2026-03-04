import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Request DTO for pagination parameters in API queries.
 *
 * Standardizes pagination input across all list endpoints to ensure consistent
 * behavior and prevent performance issues from oversized result sets. Enforces
 * minimum values to maintain API reliability and reasonable response times.
 */
export class PaginationDto {
  @ApiProperty({
    description: 'Page number to retrieve (1-based indexing)',
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page number must be at least 1' })
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'Number of records to return per page (performance limited)',
    example: 10,
    type: Number,
    minimum: 1,
    maximum: 5000,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Pagelimit must be at least 1' })
  @IsNumber()
  limit: number;

  constructor(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
  }
}

/**
 * DTO for sorting configuration in list queries.
 *
 * Provides standardized sorting controls across all list endpoints to ensure
 * predictable result ordering and consistent API behavior. Supports both
 * ascending and descending sort orders for flexible data presentation.
 */
export class SortDto {
  @ApiPropertyOptional({
    description: 'Entity field name to sort results by',
    example: 'createdAt',
    type: String,
  })
  @IsString()
  @IsOptional()
  sortField?: string;

  @ApiPropertyOptional({
    description: 'Sort direction for result ordering',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    type: String,
    default: 'ASC',
    required: false,
  })
  @IsEnum(['ASC', 'DESC'], {
    message: 'sortOrder must be either ASC or DESC',
    each: true,
  })
  @IsOptional()
  sortOrder: 'ASC' | 'DESC';

  constructor(sortOrder: 'ASC' | 'DESC' = 'ASC', sortField?: string) {
    this.sortField = sortField;
    this.sortOrder = sortOrder;
  }
}

/**
 * Base response wrapper for paginated API endpoints providing metadata about result sets.
 *
 * Implements standard pagination metadata pattern used across all paginated responses
 * to ensure consistent client-side pagination implementation and navigation controls.
 * Calculates total pages automatically based on record count and page size.
 */
export class PaginatedResponseDto extends PaginationDto {
  @ApiProperty({
    description: 'Total number of records matching the query criteria',
    example: 150,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description:
      'Total number of pages available based on record count and page size',
    example: 15,
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  totalPages: number;

  constructor(total: number, page: number, limit: number) {
    super(page, limit);
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
  }
}

export class QueryRequestDto {
  @ApiProperty({
    description:
      'Pagination parameters to control page size and number of results',
    type: PaginationDto,
    required: true,
  })
  @Type(() => PaginationDto)
  @ValidateNested()
  pagination: PaginationDto;

  @ApiProperty({
    description:
      'Pagination parameters to control page size and number of results',
    type: SortDto,
    required: true,
  })
  @Type(() => SortDto)
  @ValidateNested()
  sort: SortDto;

  constructor(pagination: PaginationDto, sort: SortDto) {
    this.pagination = pagination;
    this.sort = sort;
  }
}
