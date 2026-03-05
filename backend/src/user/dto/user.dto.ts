import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  PaginatedResponseDto,
  QueryRequestDto,
} from 'src/common/pagination.dto';
import { UserSortField } from '../user.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The firstName of the user',
    example: 'John',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'The lastName of the user',
    example: 'Doe',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  constructor(email: string, firstName: string, lastName: string) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export class GetUserResponseDto extends CreateUserDto {
  @ApiProperty({
    description: 'The id of the user',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  constructor(id: number, email: string, firstName: string, lastName: string) {
    super(email, firstName, lastName);
    this.id = id;
  }
}

export class GetPaginatedUsersResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    description: 'List of users for the current page',
    type: [GetUserResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => GetUserResponseDto)
  data: GetUserResponseDto[];

  constructor(
    data: GetUserResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    super(total, page, limit);
    this.data = data;
  }
}

export class GetPaginatedUserRequestDto extends QueryRequestDto {
  @ApiPropertyOptional({
    description: 'Filter users by IDs',
    example: [1, 2],
    type: Number,
    isArray: true,
  })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsNumber({}, { each: true })
  @IsOptional()
  ids?: number[];

  @ApiPropertyOptional({
    description: 'Filter users by email addresses',
    example: ['johndoe@gmail.com', 'willsmith@gmail.com'],
    type: String,
    isArray: true,
  })
  @IsEmail({}, { each: true })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(String) : [String(value)],
  )
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
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(String) : [String(value)],
  )
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
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(String) : [String(value)],
  )
  lastNames?: string[];

  @ApiPropertyOptional({
    description: 'User field name to sort results by',
    enum: UserSortField,
    example: UserSortField.CREATED_AT,
    type: String,
  })
  @IsEnum(UserSortField, {
    message: `sortField must be one of the following: ${Object.values(
      UserSortField,
    ).join(', ')}`,
  })
  @IsOptional()
  sortField?: UserSortField;

  constructor(
    page: number,
    limit: number,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    ids?: number[],
    sortField?: UserSortField,
    emails?: string[],
    firstNames?: string[],
    lastNames?: string[],
  ) {
    super(page, limit, sortOrder);
    this.ids = ids;
    this.sortField = sortField;
    this.emails = emails;
    this.firstNames = firstNames;
    this.lastNames = lastNames;
  }
}
