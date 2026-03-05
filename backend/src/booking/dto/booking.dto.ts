import {
  IsString,
  IsNotEmpty,
  IsInt,
  MinLength,
  MaxLength,
  IsNumber,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  PaginatedResponseDto,
  QueryRequestDto,
} from 'src/common/pagination.dto';
import { Type } from 'class-transformer';
import { ToArray } from 'src/common/array.decorator';
import { BookingSortFields } from '../booking.enum';
import { GetUserResponseDto } from 'src/user/dto/user.dto';

export class CreateBookingDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ example: 'ABC-123-XYZ' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  confirmationNumber: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user making the booking',
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  constructor(externalId: string, confirmationNumber: string, userId: number) {
    this.externalId = externalId;
    this.confirmationNumber = confirmationNumber;
    this.userId = userId;
  }
}

export class GetBookingResponseDto extends OmitType(CreateBookingDto, [
  'userId',
]) {
  @ApiProperty({
    description: 'The id of the booking',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'The user who made the booking',
    type: () => GetUserResponseDto,
    required: true,
  })
  @ValidateNested()
  @Type(() => GetUserResponseDto)
  user: GetUserResponseDto;

  constructor(
    id: number,
    externalId: string,
    confirmationNumber: string,
    user: GetUserResponseDto,
  ) {
    super(externalId, confirmationNumber);
    this.id = id;
    this.user = user;
  }
}

export class GetUserBookingsResponseDto extends OmitType(
  GetBookingResponseDto,
  ['user'],
) {}

export class getPaginatedUserBookingsResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    description: 'List of bookings for the current page',
    type: [GetUserBookingsResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => GetUserBookingsResponseDto)
  data: GetUserBookingsResponseDto[];

  constructor(
    data: GetUserBookingsResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    super(total, page, limit);
    this.data = data;
  }
}

export class GetPagiantedUserBookingsRequestDto extends QueryRequestDto {
  @ApiPropertyOptional({
    description: 'Booking field name to sort results by',
    enum: BookingSortFields,
    example: BookingSortFields.CREATED_AT,
    type: String,
  })
  @IsEnum(BookingSortFields, {
    message: `sortField must be one of the following: ${Object.values(
      BookingSortFields,
    ).join(', ')}`,
  })
  @IsOptional()
  sortField?: BookingSortFields;

  constructor(
    page: number,
    limit: number,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    sortField?: BookingSortFields,
  ) {
    super(page, limit, sortOrder);
    this.sortField = sortField;
  }
}

export class GetPaginatedBookingsResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    description: 'List of bookings for the current page',
    type: [GetBookingResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => GetBookingResponseDto)
  data: GetBookingResponseDto[];

  constructor(
    data: GetBookingResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    super(total, page, limit);
    this.data = data;
  }
}

export class GetPaginatedBookingRequestDto extends QueryRequestDto {
  @ApiPropertyOptional({
    description: 'Filter bookings by IDs',
    example: [1, 2],
    type: Number,
    isArray: true,
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  @ToArray()
  ids?: number[];

  @ApiPropertyOptional({
    description: 'Filter bookings by external IDs',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: String,
    isArray: true,
  })
  @IsString({ each: true })
  @IsOptional()
  @ToArray()
  externalIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter bookings by confirmation numbers',
    example: ['ABC-123-XYZ', 'DEF-456-UVW'],
    type: String,
    isArray: true,
  })
  @IsString({ each: true })
  @IsOptional()
  @ToArray()
  confirmationNumbers?: string[];

  @ApiPropertyOptional({
    description: 'Filter users by IDs',
    example: [1, 2],
    type: Number,
    isArray: true,
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  @ToArray()
  userIds?: number[];

  @ApiPropertyOptional({
    description: 'Filter users by email addresses',
    example: ['johndoe@gmail.com', 'willsmith@gmail.com'],
    type: String,
    isArray: true,
  })
  @IsEmail({}, { each: true })
  @IsOptional()
  @ToArray()
  emails?: string[];

  @ApiPropertyOptional({
    description: 'Filter users by first names',
    example: ['John', 'Will'],
    type: String,
    isArray: true,
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  @ToArray()
  firstNames?: string[];

  @ApiPropertyOptional({
    description: 'Filter users by last names',
    example: ['Doe', 'Smith'],
    type: String,
    isArray: true,
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  @ToArray()
  lastNames?: string[];

  @ApiPropertyOptional({
    description: 'Booking field name to sort results by',
    enum: BookingSortFields,
    example: BookingSortFields.CREATED_AT,
    type: String,
  })
  @IsEnum(BookingSortFields, {
    message: `sortField must be one of the following: ${Object.values(
      BookingSortFields,
    ).join(', ')}`,
  })
  @IsOptional()
  sortField?: BookingSortFields;

  constructor(
    page: number,
    limit: number,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    sortField?: BookingSortFields,
    ids?: number[],
    externalIds?: string[],
    confirmationNumbers?: string[],
    userIds?: number[],
    emails?: string[],
    firstNames?: string[],
    lastNames?: string[],
  ) {
    super(page, limit, sortOrder);
    this.sortField = sortField;
    this.ids = ids;
    this.externalIds = externalIds;
    this.confirmationNumbers = confirmationNumbers;
    this.userIds = userIds;
    this.emails = emails;
    this.firstNames = firstNames;
    this.lastNames = lastNames;
  }
}
