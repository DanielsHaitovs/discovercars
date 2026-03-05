import { ConflictException } from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, GetPaginatedUserRequestDto } from '../dto/user.dto';
import { TypeOrmError } from 'src/common/typeorm.error';

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

describe('UserService', () => {
  let userService: UserService;
  let userRepository: RepositoryMock;
  let queryBuilder: QueryBuilderMock;

  const buildTypeOrmError = (code: string): TypeOrmError =>
    new TypeOrmError(
      'INSERT INTO "user"',
      [],
      Object.assign(new Error('db error'), { code }),
    );

  const dto: CreateUserDto = {
    email: 'jane.doe@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  const buildTimestamp = () => new Date('2024-01-01T00:00:00.000Z');

  const buildUser = (overrides: Partial<User> = {}): User => {
    const user = new User(
      overrides.id ?? 1,
      overrides.email ?? dto.email,
      overrides.firstName ?? dto.firstName,
      overrides.lastName ?? dto.lastName,
      overrides.createdAt ?? buildTimestamp(),
      overrides.updatedAt ?? buildTimestamp(),
      overrides.bookings ?? [],
    );

    return Object.assign(user, overrides);
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

    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneByOrFail: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    userService = new UserService(
      userRepository as unknown as Repository<User>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should persist a user when repository succeeds', async () => {
      const user = buildUser();
      userRepository.create.mockReturnValue(user);
      userRepository.save.mockResolvedValue(user);

      await expect(userService.create(dto)).resolves.toBe(user);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw ConflictException when repository reports duplicate emails', async () => {
      userRepository.create.mockReturnValue(buildUser());
      userRepository.save.mockRejectedValueOnce(buildTypeOrmError('23505'));

      await expect(userService.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should rethrow unexpected persistence errors', async () => {
      const unexpectedError = new Error('database unavailable');
      userRepository.create.mockReturnValue(buildUser());
      userRepository.save.mockRejectedValueOnce(unexpectedError);

      await expect(userService.create(dto)).rejects.toBe(unexpectedError);
    });
  });

  describe('findMany', () => {
    it('should apply all provided filters and return pagination metadata', async () => {
      const items = [buildUser({ id: 42 })];
      queryBuilder.getManyAndCount.mockResolvedValueOnce([items, 1]);

      const request = {
        page: 2,
        limit: 5,
        sortOrder: 'DESC',
        sortField: 'createdAt',
        ids: [1],
        emails: ['a@example.com'],
        firstNames: ['John'],
        lastNames: ['Smith'],
      } as unknown as GetPaginatedUserRequestDto;

      const result = await userService.findMany(request);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(5);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'user.id IN (:...ids)',
        { ids: [1] },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'user.email IN (:...emails)',
        { emails: ['a@example.com'] },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        3,
        'user.firstName IN (:...firstNames)',
        { firstNames: ['John'] },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        4,
        'user.lastName IN (:...lastNames)',
        { lastNames: ['Smith'] },
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
      } as unknown as GetPaginatedUserRequestDto;

      const result = await userService.findMany(request);

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

  describe('findOneByIdOrThrow', () => {
    it('should return the user when found', async () => {
      const user = buildUser({ id: 7 });
      userRepository.findOneByOrFail.mockResolvedValueOnce(user);

      await expect(userService.findOneByIdOrThrow(7)).resolves.toBe(user);
      expect(userRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 7 });
    });

    it('should bubble up repository errors', async () => {
      const error = new EntityNotFoundError(User, { id: 8 });
      userRepository.findOneByOrFail.mockRejectedValueOnce(error);

      await expect(userService.findOneByIdOrThrow(8)).rejects.toBe(error);
    });
  });
});
