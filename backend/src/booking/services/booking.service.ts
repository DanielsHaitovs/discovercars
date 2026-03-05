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
    const { userId, ...bookingData } = createBookingDto;

    const booking = this.bookingRepository.create({
      ...bookingData,
      user: { id: userId } as User,
    });

    return await this.bookingRepository
      .save(booking)
      .catch((error: TypeOrmError) => {
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
   * Retrieves a paginated list of bookings based on the provided query parameters.
   * @param data - Data transfer object containing pagination, sorting, and filtering details.
   * @returns A paginated response containing the list of bookings and pagination metadata.
   */
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
      userIds,
      emails,
      firstNames,
      lastNames,
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

    queryBuilder.leftJoinAndSelect('booking.user', 'user');

    if (userIds?.length) {
      queryBuilder.andWhere('user.id IN (:...userIds)', { userIds });
    }

    if (emails?.length) {
      queryBuilder.andWhere('user.email IN (:...emails)', { emails });
    }

    if (firstNames?.length) {
      queryBuilder.andWhere('user.firstName IN (:...firstNames)', {
        firstNames,
      });
    }

    if (lastNames?.length) {
      queryBuilder.andWhere('user.lastName IN (:...lastNames)', {
        lastNames,
      });
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
