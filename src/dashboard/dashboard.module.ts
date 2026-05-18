import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { QuestionEntity } from '../questions/entities/question.entity.js';
import { NoticeEntity } from '../notices/entities/notice.entity.js';
import { InterviewEntity } from '../interviews/entities/interview.entity.js';
import { ReportEntity } from '../reports/entities/report.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      QuestionEntity,
      NoticeEntity,
      InterviewEntity,
      ReportEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
