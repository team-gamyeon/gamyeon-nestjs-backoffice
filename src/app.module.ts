import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConsulModule } from './consul/consul.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InterviewsModule } from './interviews/interviews.module';
import { NoticesModule } from './notices/notices.module';
import { QuestionsModule } from './questions/questions.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env_backoffice' : '.env',
    }),
    DatabaseModule,
    ConsulModule,
    AuthModule,
    DashboardModule,
    UsersModule,
    ReportsModule,
    QuestionsModule,
    NoticesModule,
    InterviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
