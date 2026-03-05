import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import {
  CreateBookingDto,
  GetBookingResponseDto,
  GetPaginatedBookingRequestDto,
  GetPaginatedBookingsResponseDto,
} from '../dto/booking.dto';
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
import { EntityNotFoundError } from 'typeorm';

@ApiTags('Bookings')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Creates a new booking with the provided information.',
  })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Data transfer object for creating a booking',
    required: true,
  })
  @ApiConflictResponse({
    description:
      'A booking with the same externalId or confirmationNumber already exists.',
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
            'externalId must be a string',
            'externalId should not be empty',
            'confirmationNumber should not be empty',
            'confirmationNumber must be between 3 and 50 characters',
            'userId must be an integer',
            'userId should not be empty',
          ],
        },
        error: { type: 'string', example: BadRequestException.name },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found. No user exists with the provided userId.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Could not find any entity of type User',
        },
        error: { type: 'string', example: EntityNotFoundError.name },
      },
    },
  })
  @ApiOkResponse({
    description: 'The booking has been successfully created.',
    type: GetBookingResponseDto,
  })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return await this.bookingService.create(createBookingDto);
  }

  @Get('query')
  @ApiOperation({
    summary: 'Get paginated list of bookings',
    description:
      'Retrieves a paginated list of bookings based on the provided filters and pagination parameters.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters. Please check the request body.',
  })
  @ApiOkResponse({
    description:
      'The paginated list of bookings has been successfully retrieved.',
    type: GetPaginatedBookingsResponseDto,
  })
  async findMany(@Query() data: GetPaginatedBookingRequestDto) {
    return await this.bookingService.findMany(data);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the booking to retrieve',
    example: 1,
  })
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Retrieves a booking by its unique identifier.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid booking ID. Please ensure the ID is a valid integer.',
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
    description: 'Booking not found. No booking exists with the provided ID.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'No entity found for Booking with id 1',
        },
        error: { type: 'string', example: 'EntityNotFoundError' },
      },
    },
  })
  @ApiOkResponse({
    description: 'The booking has been successfully retrieved.',
    type: GetBookingResponseDto,
  })
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingService.findOneByIdOrThrow(id);
  }

  @Get(':externalId')
  @ApiParam({
    name: 'externalId',
    description: 'The unique external identifier of the booking to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: 'Get booking by external ID',
    description: 'Retrieves a booking by its unique external identifier.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid booking external ID. Please ensure the external ID is a valid string.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Validation failed (string is expected)',
        },
        error: { type: 'string', example: BadRequestException.name },
      },
    },
  })
  @ApiNotFoundResponse({
    description:
      'Booking not found. No booking exists with the provided external ID.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example:
            'No entity found for Booking with externalId 123e4567-e89b-12d3-a456-426614174000',
        },
        error: { type: 'string', example: 'EntityNotFoundError' },
      },
    },
  })
  @ApiOkResponse({
    description: 'The booking has been successfully retrieved.',
    type: GetBookingResponseDto,
  })
  async findOneByExternalId(@Param('externalId') externalId: string) {
    return await this.bookingService.findOneByExternalIdOrThrow(externalId);
  }
}
