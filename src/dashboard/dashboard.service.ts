import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity.js';
import { QuestionEntity } from '../questions/entities/question.entity.js';
import { NoticeEntity } from '../notices/entities/notice.entity.js';
import { InterviewEntity } from '../interviews/entities/interview.entity.js';
import { ReportEntity } from '../reports/entities/report.entity.js';
import { withSchemaFallback } from '../database/schema-guard.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
    @InjectRepository(NoticeEntity)
    private readonly noticeRepo: Repository<NoticeEntity>,
    @InjectRepository(InterviewEntity)
    private readonly interviewRepo: Repository<InterviewEntity>,
    @InjectRepository(ReportEntity)
    private readonly reportRepo: Repository<ReportEntity>,
  ) {}

  async getKpi() {
    const totalUsers = await withSchemaFallback(() => this.userRepo.count(), 0);
    const totalNotices = await withSchemaFallback(
      () => this.noticeRepo.count(),
      0,
    );
    const activeQuestions = await withSchemaFallback(
      () =>
        this.questionRepo.count({
          where: { status: 'ACTIVE' },
        }),
      0,
    );

    const interviewStatusCounts = await withSchemaFallback(
      () =>
        this.interviewRepo
          .createQueryBuilder('intv')
          .select('intv.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('intv.status')
          .getRawMany<{ status: string; count: string }>(),
      [] as { status: string; count: string }[],
    );

    const pausedCount = Number(
      interviewStatusCounts.find((r) => r.status === 'PAUSED')?.count ?? 0,
    );

    const reportStatusCounts = await this.getReportStatusCounts();

    const analyzingReports = Number(
      reportStatusCounts.find((r) => r.status === 'IN_PROGRESS')?.count ?? 0,
    );

    return {
      totalUsers: { value: totalUsers },
      activeQuestions: { value: activeQuestions },
      totalNotices: { value: totalNotices },
      pausedInterviews: { value: pausedCount },
      analyzingReports: { value: analyzingReports },
    };
  }

  async getSignupTrend(days: number = 13) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const rows = await withSchemaFallback(
      () =>
        this.userRepo
          .createQueryBuilder('user')
          .select("TO_CHAR(user.created_at, 'YYYY-MM-DD')", 'date')
          .addSelect('COUNT(*)', 'count')
          .where('user.created_at >= :since', { since })
          .groupBy("TO_CHAR(user.created_at, 'YYYY-MM-DD')")
          .orderBy('date', 'ASC')
          .getRawMany<{ date: string; count: string }>(),
      [] as { date: string; count: string }[],
    );

    const countMap = new Map(rows.map((r) => [r.date, Number(r.count)]));

    const items: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]!;
      items.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
    }

    return { period: `최근 ${days}일`, items };
  }

  async getInterviewCompletion() {
    const rows = await withSchemaFallback(
      () =>
        this.interviewRepo
          .createQueryBuilder('intv')
          .select('intv.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('intv.status')
          .getRawMany<{ status: string; count: string }>(),
      [] as { status: string; count: string }[],
    );

    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const segments = rows.map((r) => ({
      label: r.status,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));

    const finishedCount = Number(
      rows.find((r) => r.status === 'FINISHED')?.count ?? 0,
    );

    return {
      completionRate: total > 0 ? Math.round((finishedCount / total) * 100) : 0,
      segments,
    };
  }

  async getReportAnalysis() {
    const rows = await this.getReportStatusCounts();

    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const segments = rows.map((r) => ({
      label: r.status,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));

    const completedCount = Number(
      rows.find((r) => r.status === 'COMPLETED')?.count ?? 0,
    );

    return {
      completionRate:
        total > 0 ? Math.round((completedCount / total) * 100) : 0,
      totalCount: total,
      segments,
    };
  }

  async getRecentActivities(limit: number = 20) {
    const recentUsers = await withSchemaFallback(
      () =>
        this.userRepo.find({
          order: { createdAt: 'DESC' },
          take: limit,
        }),
      [] as UserEntity[],
    );

    const recentInterviews = await withSchemaFallback(
      () =>
        this.interviewRepo.find({
          relations: ['user'],
          order: { createdAt: 'DESC' },
          take: limit,
        }),
      [] as InterviewEntity[],
    );

    type ActivityItem = {
      type: string;
      message: string;
      createdAt: string;
    };

    const items: ActivityItem[] = [];

    for (const u of recentUsers) {
      items.push({
        type: 'USER_JOINED',
        message: `새 유저 ${u.nickname}님이 가입했습니다`,
        createdAt: u.createdAt.toISOString(),
      });
    }

    for (const iv of recentInterviews) {
      const nickname = iv.user?.nickname ?? '알 수 없음';
      if (iv.status === 'FINISHED') {
        items.push({
          type: 'INTERVIEW_COMPLETED',
          message: `${nickname}님의 면접이 완료되었습니다`,
          createdAt: (iv.finishedAt ?? iv.updatedAt).toISOString(),
        });
      } else if (iv.status === 'PAUSED') {
        items.push({
          type: 'INTERVIEW_PAUSED',
          message: `${nickname}님이 면접을 일시정지했습니다`,
          createdAt: (iv.pausedAt ?? iv.updatedAt).toISOString(),
        });
      }
    }

    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { items: items.slice(0, limit) };
  }

  async getSummary() {
    const [kpi, signupTrend, interviewCompletion, reportAnalysis, recentActivities] =
      await Promise.all([
        this.getKpi(),
        this.getSignupTrend(),
        this.getInterviewCompletion(),
        this.getReportAnalysis(),
        this.getRecentActivities(),
      ]);

    return {
      kpi,
      signupTrend,
      interviewCompletion,
      reportAnalysis,
      recentActivities,
    };
  }

  private async getReportStatusCounts() {
    const rows = await withSchemaFallback(
      () =>
        this.reportRepo
          .createQueryBuilder('report')
          .select('report.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('report.status')
          .getRawMany<{ status: string; count: string }>(),
      [] as { status: string; count: string }[],
    );

    const normalized = new Map<string, number>();
    for (const row of rows) {
      const status = row.status === 'SUCCEED' ? 'COMPLETED' : row.status;
      normalized.set(status, (normalized.get(status) ?? 0) + Number(row.count));
    }

    return Array.from(normalized.entries()).map(([status, count]) => ({
      status,
      count: String(count),
    }));
  }
}
