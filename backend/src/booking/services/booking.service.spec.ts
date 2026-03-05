import { ConflictException } from '@nestjs/common';
import { type UUID } from 'crypto';
import { BookingService } from './booking.service';
import { Booking } from '../entities/booking.entity';
import {
  CreateBookingDto,
  GetPaginatedBookingRequestDto,
} from '../dto/booking.dto';
import { EntityNotFoundError, Repository } from 'typeorm';
import { TypeOrmError } from 'src/common/typeorm.error';
import { User } from 'src/user/entities/user.entity';

type RepositoryMock = {
  create: jest.Mock;
  save: jest.Mock;
  findOneByOrFail: jest.Mock;
  createQueryBuilder: jest.Mock;
};

type QueryBuilderMock = {
  orderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  andWhere: jest.Mock;
  getManyAndCount: jest.Mock;
};

describe('BookingService', () => {
  let bookingService: BookingService;
  let bookingRepository: RepositoryMock;
  let queryBuilder: QueryBuilderMock;
  let consoleSpy: jest.SpyInstance;

  const buildTypeOrmError = (code: string): TypeOrmError =>
    new TypeOrmError(
      'INSERT INTO booking',
      [],
      Object.assign(new Error('db error'), { code }),
    );

  const dto: CreateBookingDto = {
    externalId: '550e8400-e29b-41d4-a716-446655440000',
    confirmationNumber: 'ABC-123-XYZ',
    userId: 1,
  };

  const buildTimestamp = () => new Date('2024-01-01T00:00:00.000Z');

  const buildUser = (overrides: Partial<User> = {}): User => {
    const user = new User(
      overrides.id ?? dto.userId,
      overrides.email ?? 'user@example.com',
      overrides.firstName ?? 'Jane',
      overrides.lastName ?? 'Doe',
      overrides.createdAt ?? buildTimestamp(),
      overrides.updatedAt ?? buildTimestamp(),
      overrides.bookings ?? [],
    );

    return Object.assign(user, overrides);
  };

  const buildBooking = (overrides: Partial<Booking> = {}): Booking => {
    const booking = new Booking(
      overrides.id ?? 1,
      (overrides.externalId ?? dto.externalId) as UUID,
      overrides.createdAt ?? buildTimestamp(),
      overrides.updatedAt ?? buildTimestamp(),
      overrides.user ?? buildUser(),
      overrides.confirmationNumber ?? dto.confirmationNumber,
    );

    return Object.assign(booking, overrides);
  };

  beforeEach(() => {
    queryBuilder = {
      orderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      andWhere: jest.fn(),
      getManyAndCount: jest.fn(),
    };

    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.skip.mockReturnValue(queryBuilder);
    queryBuilder.take.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);

    bookingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneByOrFail: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    bookingService = new BookingService(
      bookingRepository as unknown as Repository<Booking>,
    );
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  describe('create', () => {
    it('should persist a booking when repository succeeds', async () => {
      const booking = buildBooking();
      bookingRepository.create.mockReturnValue(booking);
      bookingRepository.save.mockResolvedValue(booking);

      await expect(bookingService.create(dto)).resolves.toBe(booking);

      expect(bookingRepository.create).toHaveBeenCalledWith(dto);
      expect(bookingRepository.save).toHaveBeenCalledWith(booking);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate externalId/confirmationNumber', async () => {
      bookingRepository.create.mockReturnValue(buildBooking());
      bookingRepository.save.mockRejectedValueOnce(buildTypeOrmError('23505'));

      await expect(bookingService.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error saving booking:', '23505');
      expect(bookingRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should convert missing user FK violations into EntityNotFoundError', async () => {
      bookingRepository.create.mockReturnValue(buildBooking());
      bookingRepository.save.mockRejectedValueOnce(buildTypeOrmError('23502'));

      await expect(bookingService.create(dto)).rejects.toBeInstanceOf(
        EntityNotFoundError,
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error saving booking:', '23502');
      expect(bookingRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should rethrow unexpected persistence errors', async () => {
      const unexpectedError = new Error('database unavailable');
      bookingRepository.create.mockReturnValue(buildBooking());
      bookingRepository.save.mockRejectedValueOnce(unexpectedError);

      await expect(bookingService.create(dto)).rejects.toBe(unexpectedError);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving booking:',
        undefined,
      );
      expect(bookingRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneByIdOrThrow', () => {
    it('should return the booking when found', async () => {
      const booking = buildBooking({ id: 7 });
      bookingRepository.findOneByOrFail.mockResolvedValueOnce(booking);

      await expect(bookingService.findOneByIdOrThrow(7)).resolves.toBe(booking);
      expect(bookingRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 7 });
    });

    it('should bubble up repository errors', async () => {
      const error = new EntityNotFoundError(Booking, { id: 8 });
      bookingRepository.findOneByOrFail.mockRejectedValueOnce(error);

      await expect(bookingService.findOneByIdOrThrow(8)).rejects.toBe(error);
    });
  });

  describe('findOneByExternalIdOrThrow', () => {
    it('should find booking by external id', async () => {
      const booking = buildBooking({ externalId: dto.externalId });
      bookingRepository.findOneByOrFail.mockResolvedValueOnce(booking);

      await expect(
        bookingService.findOneByExternalIdOrThrow(dto.externalId),
      ).resolves.toBe(booking);
      expect(bookingRepository.findOneByOrFail).toHaveBeenCalledWith({
        externalId: dto.externalId,
      });
    });

    it('should bubble up repository errors', async () => {
      const error = new EntityNotFoundError(Booking, {
        externalId: dto.externalId,
      });
      bookingRepository.findOneByOrFail.mockRejectedValueOnce(error);

      await expect(
        bookingService.findOneByExternalIdOrThrow(dto.externalId),
      ).rejects.toBe(error);
      expect(bookingRepository.findOneByOrFail).toHaveBeenCalledWith({
        externalId: dto.externalId,
      });
    });
  });

  describe('findMany', () => {
    it('should apply filters and return a paginated payload', async () => {
      const items = [buildBooking({ id: 1 })];
      queryBuilder.getManyAndCount.mockResolvedValueOnce([items, 1]);

      const request = {
        page: 2,
        limit: 5,
        sortOrder: 'DESC',
        sortField: 'createdAt',
        ids: [1],
        externalIds: ['uuid'],
        confirmationNumbers: ['CONF'],
      } as unknown as GetPaginatedBookingRequestDto;

      const result = await bookingService.findMany(request);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'booking.createdAt',
        'DESC',
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(5);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'booking.externalId IN (:...externalIds)',
        { externalIds: ['uuid'] },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'booking.confirmationNumber IN (:...confirmationNumbers)',
        { confirmationNumbers: ['CONF'] },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        3,
        'booking.id IN (:...ids)',
        { ids: [1] },
      );
      expect(result).toEqual({
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
        data: items,
      });
    });

    it('should skip optional filters when arrays are empty', async () => {
      queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const request = {
        page: 1,
        limit: 10,
        sortOrder: 'ASC',
        sortField: 'id',
      } as unknown as GetPaginatedBookingRequestDto;

      const result = await bookingService.findMany(request);

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        data: [],
      });
    });
  });
});
