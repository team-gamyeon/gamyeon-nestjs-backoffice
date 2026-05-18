import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity.js';
import { ListReportsQueryDto } from './dto/list-reports-query.dto.js';
import {
  withSchemaReadGuard,
} from '../database/schema-guard.js';

type ReportListItem = {
  id: number;
  reportId: string;
  intvId: string;
  userId: number;
  user: ReportEntity['user'];
  jobCategory: string | null;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  score: number | null;
  createdAt: string;
  completedAt: string | null;
};

type ReportDetailResponse = ReportListItem & {
  strengths: string[];
  improvements: string[];
  feedback: string | null;
  reportData: Record<string, unknown> | null;
  questionResults: Array<Record<string, never>>;
};

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepo: Repository<ReportEntity>,
  ) {}

  async listReports(query: ListReportsQueryDto) {
    return withSchemaReadGuard(async () => {
      const { page = 1, limit = 20, sortOrder = 'desc' } = query;
      const sortBy = query.sortBy ?? 'completedAt';

      this.logger.log(
        `listReports query=${JSON.stringify({
          page,
          limit,
          sortBy,
          sortOrder,
          status: query.status ?? null,
          search: query.search ?? null,
        })}`,
      );

      try {
        const qb = this.reportRepo
          .createQueryBuilder('report')
          .leftJoinAndSelect('report.user', 'user');

        if (query.status && query.status !== 'ALL') {
          qb.andWhere('report.status = :status', {
            status: query.status === 'COMPLETED' ? 'SUCCEED' : query.status,
          });
        }

        if (query.search) {
          qb.andWhere(
            '(CAST(report.id AS TEXT) ILIKE :search OR CAST(report.intv_id AS TEXT) ILIKE :search OR user.nickname ILIKE :search)',
            { search: `%${query.search}%` },
          );
        }

        const totalCount = await this.reportRepo.count();

        const columnMap: Record<string, string> = {
          completedAt: 'report.updatedAt',
          createdAt: 'report.createdAt',
          score: 'report.totalScore',
        };
        qb.orderBy(
          columnMap[sortBy] ?? 'report.updatedAt',
          sortOrder.toUpperCase() as 'ASC' | 'DESC',
          sortBy === 'score' ? 'NULLS LAST' : undefined,
        );
        qb.skip((page - 1) * limit).take(limit);

        const [items, filteredCount] = await qb.getManyAndCount();
        const responseItems = items.map((item) => this.toReportListItem(item));

        this.logger.log(
          `listReports result=${JSON.stringify({
            totalCount,
            filteredCount,
            returnedCount: responseItems.length,
            firstIds: responseItems.slice(0, 5).map((item) => item.reportId),
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
          `listReports failed query=${JSON.stringify({
            page,
            limit,
            sortBy,
            sortOrder,
            status: query.status ?? null,
            search: query.search ?? null,
          })}`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
        throw error;
      }
    }, '리포트');
  }

  async getReportById(reportId: string): Promise<ReportDetailResponse> {
    return withSchemaReadGuard(async () => {
      const numericId = Number(reportId);
      this.logger.log(
        `getReportById reportId=${reportId} numericId=${
          Number.isNaN(numericId) ? 'NaN' : numericId
        }`,
      );

      try {
        const report = await this.reportRepo.findOne({
          where: Number.isNaN(numericId) ? { id: -1 } : { id: numericId },
          relations: ['user'],
        });
        if (!report) {
          this.logger.warn(`getReportById notFound reportId=${reportId}`);
          throw new NotFoundException({
            code: 'REPORT_NOT_FOUND',
            message: '해당 리포트를 찾을 수 없습니다.',
          });
        }

        const strengths = this.toStringArray(report.strengths);
        const improvements = this.toStringArray(report.weaknesses);
        const response = {
          ...this.toReportListItem(report),
          strengths,
          improvements,
          feedback: this.extractFeedback(report.reportData),
          reportData: report.reportData,
          questionResults: [],
        };

        this.logger.log(
          `getReportById success=${JSON.stringify({
            reportId: response.reportId,
            intvId: response.intvId,
            status: response.status,
            score: response.score,
          })}`,
        );

        return response;
      } catch (error) {
        this.logger.error(
          `getReportById failed reportId=${reportId}`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
        throw error;
      }
    }, '리포트');
  }

  private toReportListItem(report: ReportEntity): ReportListItem {
    return {
      id: report.id,
      reportId: String(report.id),
      intvId: String(report.intvId),
      userId: report.userId,
      user: report.user,
      jobCategory: report.jobCategory,
      status: this.normalizeStatus(report.status),
      score: report.totalScore,
      createdAt: report.createdAt.toISOString(),
      completedAt: report.status === 'IN_PROGRESS'
        ? null
        : report.updatedAt.toISOString(),
    };
  }

  private normalizeStatus(
    status: ReportEntity['status'],
  ): 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' {
    return status === 'SUCCEED' ? 'COMPLETED' : status;
  }

  private toStringArray(value: string[] | null): string[] {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  }

  private extractFeedback(
    reportData: Record<string, unknown> | null,
  ): string | null {
    if (!reportData) {
      return null;
    }

    const directFeedback = reportData.feedback;
    if (typeof directFeedback === 'string') {
      return directFeedback;
    }

    const summary = reportData.summary;
    if (typeof summary === 'string') {
      return summary;
    }

    return null;
  }
}
