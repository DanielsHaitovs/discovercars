import { ConflictException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  GetPaginatedUserRequestDto,
  GetPaginatedUsersResponseDto,
  GetUserResponseDto,
} from '../dto/user.dto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmError } from 'src/common/typeorm.error';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user with the provided information.
   * @param createUserDto - Data transfer object containing user creation details.
   * @returns The created user as a GetUserResponseDto.
   * @throws ConflictException if a user with the same email already exists.
   * @throws TypeOrmError for any other database-related errors.
   */
  async create(createUserDto: CreateUserDto): Promise<GetUserResponseDto> {
    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user).catch((error: TypeOrmError) => {
      if (error?.driverError?.code === '23505') {
        throw new ConflictException(
          'A user with the same email already exists.',
        );
      }

      throw error;
    });
  }

  /**
   * Retrieves a paginated list of users based on the provided query parameters.
   * @param data - Data transfer object containing pagination, sorting, and filtering details.
   * @returns A paginated response containing the list of users and pagination metadata.
   */
  async findMany(
    data: GetPaginatedUserRequestDto,
  ): Promise<GetPaginatedUsersResponseDto> {
    const {
      page,
      limit,
      sortOrder,
      sortField,
      ids,
      emails,
      firstNames,
      lastNames,
    } = data;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy(`user.${sortField}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    if (ids?.length) {
      queryBuilder.andWhere('user.id IN (:...ids)', { ids });
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
      queryBuilder.andWhere('user.lastName IN (:...lastNames)', { lastNames });
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

  /**
   * Retrieves a single user by their unique identifier.
   * @param id - The unique identifier of the user to retrieve.
   * @returns The user corresponding to the provided ID as a GetUserResponseDto.
   * @throws EntityNotFoundError if no user with the given ID exists.
   */
  async findOneByIdOrThrow(id: number): Promise<GetUserResponseDto> {
    return await this.userRepository.findOneByOrFail({ id });
  }

  /**
   * Retrieves a single user by their email address.
   * @param email - The email address of the user to retrieve.
   * @returns The user corresponding to the provided email as a GetUserResponseDto.
   * @throws EntityNotFoundError if no user with the given email exists.
   */
  async findOneByEmailOrThrow(email: string): Promise<GetUserResponseDto> {
    return await this.userRepository.findOneByOrFail({ email });
  }
}
