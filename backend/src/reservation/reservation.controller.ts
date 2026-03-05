import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateReservationDto,
  LocationDto,
  OfferDto,
} from './dto/reservation.dto';
import { ReservationService } from './reservation.service';
import { GetBookingResponseDto } from 'src/booking/dto/booking.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('locations')
  @ApiOperation({
    summary: 'Get available car rental locations',
    description:
      'Retrieves a list of available car rental locations from the external API.',
  })
  @ApiOkResponse({
    description:
      'List of available car rental locations retrieved successfully.',
    type: LocationDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description:
      'An error occurred while retrieving available locations from the external API.',
  })
  @ApiNotFoundResponse({
    description:
      'No available locations found or invalid response from the external API.',
  })
  async getAvailableLocations() {
    return this.reservationService.getAvailableLocations();
  }

  @Get('offers/:locationId')
  @ApiParam({
    name: 'locationId',
    description: 'ID of the location to retrieve offers for',
    example: 101,
  })
  @ApiOperation({
    summary: 'Get offers for a specific location',
    description:
      'Retrieves a list of car rental offers for a specific location from the external API.',
  })
  @ApiOkResponse({
    description: 'List of car rental offers retrieved successfully.',
    type: OfferDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description:
      'An error occurred while retrieving location offers from the external API.',
  })
  @ApiNotFoundResponse({
    description:
      'No offers found for the specified location or invalid response from the external API.',
  })
  async getLocationOffers(
    @Param('locationId', ParseIntPipe) locationId: number,
  ) {
    return this.reservationService.getLocationOffers(locationId);
  }

  @Post()
  @ApiBody({
    description: 'Data required to create a car rental reservation',
    type: CreateReservationDto,
  })
  @ApiOperation({
    summary: 'Create a new car rental reservation',
    description: 'Creates a new car rental reservation using the external API.',
  })
  @ApiOkResponse({
    description: 'Car rental reservation created successfully.',
    type: GetBookingResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while creating the car rental reservation.',
  })
  @ApiNotFoundResponse({
    description:
      'Invalid response from the external API when creating the reservation.',
  })
  async createReservation(@Body() data: CreateReservationDto) {
    return this.reservationService.createReservation(data);
  }
}
