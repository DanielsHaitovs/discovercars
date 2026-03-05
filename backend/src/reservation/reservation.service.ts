import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReservationDto,
  LocationDto,
  OfferDto,
  ReservationDto,
  ReservationRequestDto,
} from './dto/reservation.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GetBookingResponseDto } from 'src/booking/dto/booking.dto';
import { UserService } from 'src/user/services/user.service';
import { BookingService } from 'src/booking/services/booking.service';

@Injectable()
export class ReservationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly bookingService: BookingService,
  ) {}

  /**
   * Retrieves a list of available car rental locations from the external API.
   * @returns An array of LocationDto objects representing the available locations.
   * @throws InternalServerErrorException if there is an error while fetching locations from the external API.
   * @throws NotFoundException if the external API returns an invalid response or no locations are found.
   */
  async getAvailableLocations(): Promise<LocationDto[]> {
    const apiBaseUrl = this.configService.get<string>(
      'BASE_DISCOVER_CARS_API_URL',
    );

    const response = await firstValueFrom(
      this.httpService.get<LocationDto[]>(`${apiBaseUrl}Locations/Locations`),
    ).catch((error) => {
      console.error('Error fetching available locations:', error);

      throw new InternalServerErrorException(
        'Failed to fetch available locations',
      );
    });

    if (!response || !response.data?.length) {
      throw new NotFoundException(
        'Invalid response from external API when fetching locations',
      );
    }

    return response.data;
  }

  /**
   * Retrieves a list of car rental offers for a specific location from the external API.
   * @param locationId The ID of the location to retrieve offers for.
   * @returns An array of OfferDto objects representing the available offers for the specified location.
   * @throws InternalServerErrorException if there is an error while fetching offers from the external API.
   * @throws NotFoundException if the external API returns an invalid response or no offers are found for the specified location.
   */
  async getLocationOffers(locationId: number): Promise<OfferDto[]> {
    const apiBaseUrl = this.configService.get<string>(
      'BASE_DISCOVER_CARS_API_URL',
    );

    const response = await firstValueFrom(
      this.httpService.get<OfferDto[]>(
        `${apiBaseUrl}Availability/GetOffers?LocationId=${locationId}`,
      ),
    ).catch((error) => {
      console.error('Error fetching location offers:', error);

      throw new InternalServerErrorException('Failed to fetch location offers');
    });

    if (!response || !response.data?.length) {
      throw new NotFoundException(
        'Invalid response from external API when fetching location offers',
      );
    }

    return response.data;
  }

  /**
   * Creates a new car rental reservation using the external API and stores the booking information in the local database.
   * @param data An object containing the necessary information to create a reservation, including userId and externalId (offer ID).
   * @returns A GetBookingResponseDto object containing the details of the created booking, including the confirmation number.
   * @throws InternalServerErrorException if there is an error while creating the reservation with the external API or storing the booking information in the local database.
   * @throws NotFoundException if the external API returns an invalid response when creating the reservation.
   * @throws BadRequestException if the external API indicates that the reservation creation failed due to invalid offer or customer details.
   */
  async createReservation(
    data: CreateReservationDto,
  ): Promise<GetBookingResponseDto> {
    const { userId, externalId } = data;

    const { firstName, lastName } =
      await this.userService.findOneByIdOrThrow(userId);

    const { confirmationNumber } = await this.carReservationApi({
      offerUId: externalId,
      customer: { name: firstName, surname: lastName },
    });

    if (!confirmationNumber) {
      throw new InternalServerErrorException(
        'Failed to create reservation: No confirmation number received from external API',
      );
    }

    return await this.bookingService.create({
      externalId,
      confirmationNumber,
      userId: userId,
    });
  }

  /**
   * Helper method to call the external API for creating a car rental reservation.
   * @param data An object containing the necessary information to create a reservation, including offerUId and customer details.
   * @returns A ReservationDto object containing the details of the created reservation, including the confirmation number.
   * @throws InternalServerErrorException if there is an error while creating the reservation with the external API.
   * @throws NotFoundException if the external API returns an invalid response when creating the reservation.
   * @throws BadRequestException if the external API indicates that the reservation creation failed due to invalid offer or customer details.
   */
  private async carReservationApi(
    data: ReservationRequestDto,
  ): Promise<ReservationDto> {
    const apiBaseUrl = this.configService.get<string>(
      'BASE_DISCOVER_CARS_API_URL',
    );

    const response = await firstValueFrom(
      this.httpService.post<ReservationDto>(
        `${apiBaseUrl}Reservations/CreateReservation`,
        data,
      ),
    ).catch((error) => {
      console.error('Error creating reservation:', error);

      throw new InternalServerErrorException('Failed to create reservation');
    });

    if (!response || !response.data) {
      throw new NotFoundException(
        'Invalid response from external API when creating reservation',
      );
    }

    if (response.data.confirmationNumber === 'Booking-0000') {
      throw new BadRequestException(
        'Failed to create reservation: Invalid offer or customer details',
      );
    }

    return response.data;
  }
}
