import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, type UserStatus } from './entities/user.entity';
import { SanctionEntity } from './entities/sanction.entity';
import type { ListUsersQueryDto } from './dto/list-users-query.dto';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto';
import {
  withSchemaReadGuard,
  withSchemaWriteGuard,
} from '../database/schema-guard.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SanctionEntity)
    private readonly sanctionRepo: Repository<SanctionEntity>,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    return withSchemaReadGuard(async () => {
      const { status, search, sortBy, sortOrder, page, limit } = query;

      const qb = this.userRepo.createQueryBuilder('user');

      if (status) {
        qb.andWhere('user.status = :status', { status });
      }
      if (search) {
        qb.andWhere(
          '(user.nickname ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const totalCount = await this.userRepo.count();
      const filteredCount = await qb.getCount();

      qb.orderBy(`user.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
      qb.skip((page - 1) * limit).take(limit);

      const items = await qb.getMany();

      return {
        totalCount,
        filteredCount,
        page,
        limit,
        items: items.map((u) => ({
          id: u.id,
          nickname: u.nickname,
          email: u.email,
          provider: u.provider,
          status: u.status,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      };
    }, '유저');
  }

  async getUserById(id: number) {
    return withSchemaReadGuard(async () => {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: ['sanctions'],
      });
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: '해당 유저를 찾을 수 없습니다.',
        });
      }
      return {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        provider: user.provider,
        status: user.status,
        withdrawnAt: user.withdrawnAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        sanctions: user.sanctions.map((s) => ({
          id: s.id,
          type: s.type,
          reason: s.reason,
          createdAt: s.createdAt,
        })),
      };
    }, '유저');
  }

  async updateUserStatus(id: number, dto: UpdateUserStatusDto) {
    return withSchemaWriteGuard(async () => {
      const user = await this.userRepo.findOneBy({ id });
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: '해당 유저를 찾을 수 없습니다.',
        });
      }

      this.validateStatusTransition(user.status, dto.status);

      user.status = dto.status;
      if (dto.status === 'WITHDREW') {
        user.withdrawnAt = new Date();
      }
      await this.userRepo.save(user);

      const sanction = this.sanctionRepo.create({
        type: dto.status,
        reason: dto.reason ?? null,
        userId: id,
        createdAt: new Date(),
      });
      await this.sanctionRepo.save(sanction);

      return {
        id: user.id,
        status: user.status,
        updatedAt: user.updatedAt,
      };
    }, '유저');
  }

  async getUserSanctions(id: number) {
    return withSchemaReadGuard(async () => {
      const user = await this.userRepo.findOneBy({ id });
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: '해당 유저를 찾을 수 없습니다.',
        });
      }

      const items = await this.sanctionRepo.find({
        where: { userId: id },
        order: { createdAt: 'DESC' },
      });

      return {
        items: items.map((s) => ({
          id: s.id,
          type: s.type,
          reason: s.reason,
          createdAt: s.createdAt,
        })),
      };
    }, '유저 제재');
  }

  private validateStatusTransition(current: UserStatus, next: UserStatus): void {
    if (current === next) {
      const labels: Record<UserStatus, string> = {
        ACTIVE: '활동',
        WARNED: '경고',
        BANNED: '정지',
        WITHDREW: '탈퇴',
      };
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message: `이미 ${labels[current]} 상태인 유저입니다.`,
      });
    }
    if (current === 'BANNED' && next === 'WARNED') {
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message: '정지 상태에서 경고로 직접 변경할 수 없습니다. 먼저 활동 복구 후 경고를 부여하세요.',
      });
    }
    if (current === 'WITHDREW') {
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message: '탈퇴한 유저의 상태를 변경할 수 없습니다.',
      });
    }
  }
}
