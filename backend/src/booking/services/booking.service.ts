import { ConflictException, Injectable } from '@nestjs/common';
import {
  CreateBookingDto,
  GetBookingResponseDto,
  GetPaginatedBookingRequestDto,
  GetPaginatedBookingsResponseDto,
} from '../dto/booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { TypeOrmError } from 'src/common/typeorm.error';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  /**
   * Creates a new booking with the provided information.
   * @param createBookingDto - Data transfer object containing booking creation details.
   * @returns The created booking as a GetBookingResponseDto.
   * @throws ConflictException if a booking with the same externalId or confirmationNumber already exists.
   * @throws TypeOrmError for any other database-related errors.
   */
  async create(
    createBookingDto: CreateBookingDto,
  ): Promise<GetBookingResponseDto> {
    const booking = this.bookingRepository.create(createBookingDto);

    return await this.bookingRepository
      .save(booking)
      .catch((error: TypeOrmError) => {
        console.log('Error saving booking:', error.driverError.code);
        if (error?.driverError?.code === '23505') {
          throw new ConflictException(
            'A booking with the same externalId or confirmationNumber already exists.',
          );
        }

        if (error?.driverError?.code === '23502') {
          throw new EntityNotFoundError(User, 'User does not exist.');
        }

        throw error;
      });
  }

  /**
   * Retrieves a single booking by its unique identifier.
   * @param id - The unique identifier of the booking to retrieve.
   * @returns The booking corresponding to the provided ID as a GetBookingResponseDto.
   * @throws EntityNotFoundError if no booking with the given ID exists.
   */
  async findOneByIdOrThrow(id: number): Promise<GetBookingResponseDto> {
    return await this.bookingRepository.findOneByOrFail({ id });
  }

  /**
   * Retrieves a single booking by its external ID.
   * @param externalId - The external ID of the booking to retrieve.
   * @returns The booking corresponding to the provided external ID as a GetBookingResponseDto.
   * @throws EntityNotFoundError if no booking with the given external ID exists.
   */
  async findOneByExternalIdOrThrow(
    externalId: string,
  ): Promise<GetBookingResponseDto> {
    return await this.bookingRepository.findOneByOrFail({ externalId });
  }

  async findMany(
    data: GetPaginatedBookingRequestDto,
  ): Promise<GetPaginatedBookingsResponseDto> {
    const {
      ids,
      page,
      limit,
      sortOrder,
      sortField,
      externalIds,
      confirmationNumbers,
    } = data;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .orderBy(`booking.${sortField}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    if (externalIds?.length) {
      queryBuilder.andWhere('booking.externalId IN (:...externalIds)', {
        externalIds,
      });
    }

    if (confirmationNumbers?.length) {
      queryBuilder.andWhere(
        'booking.confirmationNumber IN (:...confirmationNumbers)',
        { confirmationNumbers },
      );
    }

    if (ids?.length) {
      queryBuilder.andWhere('booking.id IN (:...ids)', { ids });
    }

    const [items, totalCount] = await queryBuilder.getManyAndCount();

    return {
      total: totalCount,
      page: page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: items,
    };
  }
}
