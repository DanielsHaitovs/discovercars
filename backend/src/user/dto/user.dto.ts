import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ToArray } from 'src/common/array.decorator';
import {
  PaginatedResponseDto,
  PaginationDto,
  QueryRequestDto,
  SortDto,
} from 'src/common/pagination.dto';

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
  id: number;
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

  constructor(
    pagination: PaginationDto,
    sort: SortDto,
    emails?: string[],
    firstNames?: string[],
    lastNames?: string[],
  ) {
    super(pagination, sort);
    this.emails = emails;
    this.firstNames = firstNames;
    this.lastNames = lastNames;
  }
}
