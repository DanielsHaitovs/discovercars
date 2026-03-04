import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  GetPaginatedUserRequestDto,
  GetPaginatedUsersResponseDto,
  GetUserResponseDto,
} from './dto/user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmError } from 'src/common/typeorm.error';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<GetUserResponseDto> {
    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user).catch((error: TypeOrmError) => {
      if (error.driverError.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    });
  }

  async findMany(
    data: GetPaginatedUserRequestDto,
  ): Promise<GetPaginatedUsersResponseDto> {
    const {
      pagination: { page, limit },
      sort: { sortOrder, sortField },
      emails,
      firstNames,
      lastNames,
    } = data;

    const [items, totalCount] = await this.userRepository
      .createQueryBuilder()
      .where(`user.email IN (:...emails)`, { emails })
      .andWhere(`user.firstName IN (:...firstNames)`, { firstNames })
      .andWhere(`user.lastName IN (:...lastNames)`, { lastNames })
      .orderBy(`user.${sortField}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      total: totalCount,
      page: page / limit + 1,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: items,
    };
  }

  findOneByIdOrThrow(id: number): Promise<GetUserResponseDto> {
    return this.userRepository.findOneByOrFail({ id });
  }
}
