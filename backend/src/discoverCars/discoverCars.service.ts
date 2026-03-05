import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  LocationDto,
  OfferDto,
  ReservationDto,
  ReservationRequestDto,
} from './dto/discoverCars.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscoverCarsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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

  async createReservation(
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

    return response.data;
  }
}
