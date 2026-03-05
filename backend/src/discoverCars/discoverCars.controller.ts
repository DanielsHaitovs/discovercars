import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DiscoverCarsService } from './discoverCars.service';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  LocationDto,
  OfferDto,
  ReservationDto,
  ReservationRequestDto,
} from './dto/discoverCars.dto';

@Controller('discoverCars')
export class DiscoverCarsController {
  constructor(private readonly discoverCarsService: DiscoverCarsService) {}

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
    return this.discoverCarsService.getAvailableLocations();
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
    return this.discoverCarsService.getLocationOffers(locationId);
  }

  @Post('reserve')
  @ApiBody({
    description: 'Data required to create a car rental reservation',
    type: ReservationRequestDto,
  })
  @ApiOperation({
    summary: 'Create a new car rental reservation',
    description: 'Creates a new car rental reservation using the external API.',
  })
  @ApiOkResponse({
    description: 'Car rental reservation created successfully.',
    type: ReservationDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while creating the car rental reservation.',
  })
  @ApiNotFoundResponse({
    description:
      'Invalid response from the external API when creating the reservation.',
  })
  async createReservation(@Body() data: ReservationRequestDto) {
    return this.discoverCarsService.createReservation(data);
  }
}
