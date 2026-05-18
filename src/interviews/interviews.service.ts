import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewEntity } from './entities/interview.entity.js';
import { ListInterviewsQueryDto } from './dto/list-interviews-query.dto.js';
import { withSchemaReadGuard } from '../database/schema-guard.js';

type InterviewResponse = Omit<InterviewEntity, 'status'> & {
  sessionId: string;
  status: 'READY' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED';
};

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    @InjectRepository(InterviewEntity)
    private readonly interviewRepo: Repository<InterviewEntity>,
  ) {}

  async listInterviews(query: ListInterviewsQueryDto) {
    return withSchemaReadGuard(async () => {
      const { page = 1, limit = 20, sortOrder = 'desc' } = query;
      const sortBy = query.sortBy ?? 'createdAt';
      const normalizedStatus = query.status;

      this.logger.log(
        `listInterviews query=${JSON.stringify({
          page,
          limit,
          sortBy,
          sortOrder,
          status: query.status ?? null,
          normalizedStatus: normalizedStatus ?? null,
          search: query.search ?? null,
          from: query.from ?? null,
          to: query.to ?? null,
        })}`,
      );

      try {
        const qb = this.interviewRepo
          .createQueryBuilder('intv')
          .leftJoinAndSelect('intv.user', 'user');

        if (normalizedStatus && normalizedStatus !== 'ALL') {
          if (normalizedStatus === 'READY') {
            qb.andWhere('intv.status IN (:...statuses)', {
              statuses: ['READY', 'CREATED'],
            });
          } else {
            qb.andWhere('intv.status = :status', {
              status: normalizedStatus,
            });
          }
        }

        if (query.search) {
          qb.andWhere(
            '(user.nickname ILIKE :search OR user.email ILIKE :search)',
            { search: `%${query.search}%` },
          );
        }

        if (query.from) {
          qb.andWhere('intv.created_at >= :from', { from: query.from });
        }
        if (query.to) {
          qb.andWhere('intv.created_at <= :to', {
            to: query.to + 'T23:59:59',
          });
        }

        const totalCount = await this.interviewRepo.count();

        const columnMap: Record<string, string> = {
          createdAt: 'intv.createdAt',
          startedAt: 'intv.startedAt',
          durationSeconds: 'intv.durationSeconds',
        };
        qb.orderBy(
          columnMap[sortBy] ?? 'intv.createdAt',
          sortOrder.toUpperCase() as 'ASC' | 'DESC',
        );
        qb.skip((page - 1) * limit).take(limit);

        const [items, filteredCount] = await qb.getManyAndCount();
        const responseItems = items.map((item) => this.toInterviewResponse(item));

        this.logger.log(
          `listInterviews result=${JSON.stringify({
            totalCount,
            filteredCount,
            returnedCount: responseItems.length,
            firstIds: responseItems.slice(0, 5).map((item) => item.id),
            statuses: [...new Set(responseItems.map((item) => item.status))],
          })}`,
        );

        return {
          totalCount,
          filteredCount,
          page,
          limit,
          items: responseItems,
        };
      } catch (error) {
        this.logger.error(
          `listInterviews failed query=${JSON.stringify({
            page,
            limit,
            sortBy,
            sortOrder,
            status: query.status ?? null,
            normalizedStatus: normalizedStatus ?? null,
            search: query.search ?? null,
            from: query.from ?? null,
            to: query.to ?? null,
          })}`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
        throw error;
      }
    }, '면접');
  }

  async getInterviewById(id: number): Promise<InterviewResponse> {
    return withSchemaReadGuard(async () => {
      this.logger.log(`getInterviewById id=${id}`);

      try {
        const interview = await this.interviewRepo.findOne({
          where: { id },
          relations: ['user'],
        });
        if (!interview) {
          this.logger.warn(`getInterviewById notFound id=${id}`);
          throw new NotFoundException({
            code: 'INTERVIEW_NOT_FOUND',
            message: '해당 면접 세션을 찾을 수 없습니다.',
          });
        }

        const response = this.toInterviewResponse(interview);
        this.logger.log(
          `getInterviewById success=${JSON.stringify({
            id: response.id,
            sessionId: response.sessionId,
            status: response.status,
            userId: response.userId,
          })}`,
        );
        return response;
      } catch (error) {
        this.logger.error(
          `getInterviewById failed id=${id}`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
        throw error;
      }
    }, '면접');
  }

  private toInterviewResponse(interview: InterviewEntity): InterviewResponse {
    return {
      ...interview,
      sessionId: String(interview.id),
      status:
        interview.status === 'CREATED' ? 'READY' : interview.status,
    };
  }
}
