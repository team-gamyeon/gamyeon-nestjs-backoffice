import { DeepPartial } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { UserEntity } from '../../users/entities/user.entity.js';
import { SanctionEntity } from '../../users/entities/sanction.entity.js';
import { QuestionEntity } from '../../questions/entities/question.entity.js';
import { NoticeEntity } from '../../notices/entities/notice.entity.js';
import { NoticeImageEntity } from '../../notices/entities/notice-image.entity.js';
import { InterviewEntity } from '../../interviews/entities/interview.entity.js';
import { ReportEntity } from '../../reports/entities/report.entity.js';
import { QuestionResultEntity } from '../../reports/entities/question-result.entity.js';

const dataSource = AppDataSource;

export async function seed() {
  const shouldDestroy = !dataSource.isInitialized;

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  console.log('Database connected.');

  const userRepo = dataSource.getRepository(UserEntity);
  const sanctionRepo = dataSource.getRepository(SanctionEntity);
  const questionRepo = dataSource.getRepository(QuestionEntity);
  const noticeRepo = dataSource.getRepository(NoticeEntity);
  const interviewRepo = dataSource.getRepository(InterviewEntity);
  const reportRepo = dataSource.getRepository(ReportEntity);
  const questionResultRepo = dataSource.getRepository(QuestionResultEntity);

  // === Users ===
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log('Users already seeded, skipping.');
    if (shouldDestroy) {
      await dataSource.destroy();
    }
    return;
  }

  const users = await userRepo.save([
    { email: 'doyun.kang@example.com', nickname: '강도윤', provider: 'GOOGLE' as const, providerId: 'g_001', status: 'ACTIVE' as const },
    { email: 'yujin.choi@example.com', nickname: '최유진', provider: 'KAKAO' as const, providerId: 'k_002', status: 'ACTIVE' as const },
    { email: 'jiyeon.hwang@example.com', nickname: '황지연', provider: 'GOOGLE' as const, providerId: 'g_003', status: 'WARNED' as const },
    { email: 'aryun.lee@example.com', nickname: '이아련', provider: 'KAKAO' as const, providerId: 'k_004', status: 'ACTIVE' as const },
    { email: 'soojin.oh@example.com', nickname: '오수진', provider: 'GOOGLE' as const, providerId: 'g_005', status: 'BANNED' as const },
    { email: 'minjae.park@example.com', nickname: '박민재', provider: 'KAKAO' as const, providerId: 'k_006', status: 'ACTIVE' as const },
    { email: 'seojun.lim@example.com', nickname: '임서준', provider: 'GOOGLE' as const, providerId: 'g_007', status: 'ACTIVE' as const },
    { email: 'dahyun.jung@example.com', nickname: '정다현', provider: 'KAKAO' as const, providerId: 'k_008', status: 'ACTIVE' as const },
  ]);
  console.log(`Seeded ${users.length} users.`);

  // === Sanctions ===
  const sanctions = await sanctionRepo.save([
    { userId: users[2]!.id, type: 'WARNED' as const, reason: '부적절한 콘텐츠 사용' },
    { userId: users[4]!.id, type: 'WARNED' as const, reason: '반복 신고 접수' },
    { userId: users[4]!.id, type: 'BANNED' as const, reason: '이용약관 위반 (3차 경고)' },
  ]);
  console.log(`Seeded ${sanctions.length} sanctions.`);

  // === Common Questions ===
  const questions = await questionRepo.save([
    { content: '자기소개를 간단히 해주세요.', status: 'ACTIVE' as const },
    { content: '지원 동기를 말씀해주세요.', status: 'ACTIVE' as const },
    { content: '본인의 강점과 약점을 말씀해주세요.', status: 'ACTIVE' as const },
    { content: '팀 프로젝트 경험을 설명해주세요.', status: 'ACTIVE' as const },
    { content: '가장 어려웠던 프로젝트와 해결 방법은?', status: 'ACTIVE' as const },
    { content: '5년 후 본인의 모습은?', status: 'ACTIVE' as const },
    { content: '갈등 상황에서 어떻게 대처하시나요?', status: 'INACTIVE' as const },
    { content: '마지막으로 하고 싶은 말씀이 있나요?', status: 'ACTIVE' as const },
  ]);
  console.log(`Seeded ${questions.length} common questions.`);

  // === Notices ===
  const notices = await noticeRepo.save([
    { title: '서비스 이용약관 변경 안내', content: '안녕하세요. 가면 서비스 이용약관이 변경되었습니다. 주요 변경 사항으로는 개인정보 처리 방침 업데이트 및 서비스 이용 범위 명확화가 포함됩니다.' },
    { title: '서버 점검 안내', content: '2026년 3월 15일 오전 2시부터 3시까지 서버 점검이 진행됩니다. 점검 중에는 서비스 이용이 제한됩니다.' },
    { title: 'AI 면접 분석 기능 추가 안내', content: '새로운 AI 면접 분석 기능이 추가되었습니다. 이제 면접 후 더욱 상세한 피드백을 받을 수 있습니다.' },
    { title: '정기 백업 점검 안내', content: '서비스 안정성 향상을 위해 매주 일요일 오전 3시에 정기 백업 점검을 실시합니다.' },
    { title: '플랫폼 별 서비스 가이드 업데이트', content: '각 플랫폼별 서비스 이용 가이드가 업데이트되었습니다.' },
  ]);
  console.log(`Seeded ${notices.length} notices.`);

  // === Interviews (INTV) ===
  const interviewData: DeepPartial<InterviewEntity>[] = [
    { userId: users[0]!.id, title: '프론트엔드 면접', status: 'FINISHED', startedAt: new Date('2026-03-01T10:00:00Z'), finishedAt: new Date('2026-03-01T10:30:00Z'), durationSeconds: 1800, totalPausedSeconds: 0 },
    { userId: users[1]!.id, title: 'PM 면접', status: 'FINISHED', startedAt: new Date('2026-03-02T14:00:00Z'), finishedAt: new Date('2026-03-02T14:25:00Z'), durationSeconds: 1500, totalPausedSeconds: 0 },
    { userId: users[2]!.id, title: '스타트업 면접', status: 'PAUSED', startedAt: new Date('2026-03-03T08:00:00Z'), pausedAt: new Date('2026-03-03T08:10:00Z'), durationSeconds: 600, totalPausedSeconds: 120 },
    { userId: users[5]!.id, title: '백엔드 면접', status: 'IN_PROGRESS', startedAt: new Date('2026-03-05T09:00:00Z'), durationSeconds: 300, totalPausedSeconds: 0 },
    { userId: users[7]!.id, title: undefined, status: 'CREATED', totalPausedSeconds: 0 },
  ];
  const interviews = await interviewRepo.save(interviewData);
  console.log(`Seeded ${interviews.length} interviews.`);

  // === Reports ===
  const reportData: DeepPartial<ReportEntity>[] = [
    {
      intvId: interviews[0]!.id,
      userId: users[0]!.id,
      jobCategory: '프론트엔드',
      status: 'SUCCEED',
      totalScore: 88,
      reportData: { feedback: '전반적으로 프론트엔드 역량이 잘 드러났습니다.' },
      strengths: ['구체적인 기술 스택과 경험을 명확히 서술하였습니다.'],
      weaknesses: ['회사 분석이 더 필요합니다.'],
      createdAt: new Date('2026-03-01T11:00:00Z'),
      updatedAt: new Date('2026-03-01T11:00:00Z'),
    },
    {
      intvId: interviews[1]!.id,
      userId: users[1]!.id,
      jobCategory: 'PM',
      status: 'SUCCEED',
      totalScore: 74,
      reportData: { feedback: '프로젝트 관리 역량은 좋으나 기술적 깊이가 부족합니다.' },
      strengths: ['경험 소개는 좋습니다.'],
      weaknesses: ['구체적인 성과 수치가 부족합니다.'],
      createdAt: new Date('2026-03-02T15:00:00Z'),
      updatedAt: new Date('2026-03-02T15:00:00Z'),
    },
    {
      intvId: interviews[2]!.id,
      userId: users[2]!.id,
      status: 'IN_PROGRESS',
      createdAt: new Date('2026-03-03T08:20:00Z'),
      updatedAt: new Date('2026-03-03T08:20:00Z'),
    },
  ];
  const reports = await reportRepo.save(reportData);
  console.log(`Seeded ${reports.length} reports.`);

  // === Question Results ===
  const qResults = await questionResultRepo.save([
    { reportId: reports[0]!.id, questionId: String(questions[0]!.id), question: '자기소개를 간단히 해주세요.', answer: 'React와 TypeScript를 주로 사용하는 프론트엔드 개발자입니다.', score: 90, feedback: '구체적인 기술 스택과 경험을 명확히 서술하였습니다.' },
    { reportId: reports[0]!.id, questionId: String(questions[1]!.id), question: '지원 동기를 말씀해주세요.', answer: '혁신적인 서비스를 만드는 팀에서 성장하고 싶습니다.', score: 85, feedback: '동기가 명확하나 회사 분석이 더 필요합니다.' },
    { reportId: reports[1]!.id, questionId: String(questions[0]!.id), question: '자기소개를 간단히 해주세요.', answer: '3년차 PM으로 B2C 서비스를 담당해왔습니다.', score: 78, feedback: '경험 소개는 좋으나 구체적인 성과 수치가 부족합니다.' },
  ]);
  console.log(`Seeded ${qResults.length} question results.`);

  console.log('Seeding complete!');
  if (shouldDestroy) {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
