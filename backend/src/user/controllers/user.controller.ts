import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  GetPaginatedUserRequestDto,
  GetPaginatedUsersResponseDto,
  GetUserResponseDto,
} from '../dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided information.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Data transfer object for creating a user',
    required: true,
  })
  @ApiConflictResponse({
    description: 'A user with the same email already exists.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data. Please check the request body.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'email must be an email',
            'email should not be empty',
            'firstName should not be empty',
            'lastName should not be empty',
          ],
        },
        error: { type: 'string', example: BadRequestException.name },
      },
    },
  })
  @ApiOkResponse({
    description: 'The user has been successfully created.',
    type: GetUserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('query')
  @ApiOperation({
    summary: 'Get paginated list of users',
    description:
      'Retrieves a paginated list of users based on the provided filters and pagination parameters.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters. Please check the request body.',
  })
  @ApiOkResponse({
    description: 'The paginated list of users has been successfully retrieved.',
    type: GetPaginatedUsersResponseDto,
  })
  async findMany(@Query() data: GetPaginatedUserRequestDto) {
    return await this.userService.findMany(data);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user to retrieve',
    example: 1,
  })
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique identifier.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID. Please ensure the ID is a valid integer.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Validation failed (numeric string is expected)',
        },
        error: { type: 'string', example: BadRequestException.name },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found. No user exists with the provided ID.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'No entity found for User with id 1',
        },
        error: { type: 'string', example: 'EntityNotFoundError' },
      },
    },
  })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: GetUserResponseDto,
  })
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOneByIdOrThrow(id);
  }

  @Get('email/:email')
  @ApiParam({
    name: 'email',
    description: 'The email address of the user to retrieve',
    example: 'test@gmail.com',
  })
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Retrieves a user by their email address.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid email address. Please ensure the email is in a valid format.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Validation failed (email must be an string)',
        },
        error: { type: 'string', example: BadRequestException.name },
      },
    },
  })
  @ApiNotFoundResponse({
    description:
      'User not found. No user exists with the provided email address.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'No entity found for User with email test@gmail.com',
        },
        error: { type: 'string', example: 'EntityNotFoundError' },
      },
    },
  })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: GetUserResponseDto,
  })
  async findOneByEmail(@Param('email') email: string) {
    return await this.userService.findOneByEmailOrThrow(email);
  }
}
